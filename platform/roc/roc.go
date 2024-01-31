package roc

/*
#cgo LDFLAGS: ./roc.o -ldl
#include "./host.h"
*/
import "C"

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"unsafe"

	"webserver/database"
)

// Roc holds the connection to roc.
type Roc struct {
	mu sync.RWMutex

	model unsafe.Pointer
}

// New initializes the connection to roc.
func New(events [][]byte) *Roc {
	var program C.struct_Program
	C.roc__mainForHost_1_exposed_generic(&program)
	model := program.init

	r := Roc{model: model}
	rocEvents := convertEvents(events)
	C.roc__mainForHost_0_caller(&r.model, &rocEvents, nil, &r.model)
	return &r
}

func setRefCountToTwo(ptr unsafe.Pointer) {
	refcountPtr := unsafe.Add(ptr, -8)
	refCountSlice := unsafe.Slice((*uint)(refcountPtr), 1)
	refCountSlice[0] = 9223372036854775809
}

// ReadRequest handles a read request.
func (r *Roc) ReadRequest(request *http.Request) (Response, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	rocRequest, err := convertRequest(request)
	if err != nil {
		return Response{}, fmt.Errorf("convert request: %w", err)
	}

	// TODO: check the refcount of the response and deallocate it if necessary.
	var response C.struct_Response
	setRefCountToTwo(r.model)
	C.roc__mainForHost_1_caller(&rocRequest, &r.model, nil, &response)

	return Response{
		Status:  int(response.status),
		Headers: toGoHeaders(response.headers),
		Body:    rocStrRead(response.body),
	}, nil
}

// WriteRequest handles a write request.
func (r *Roc) WriteRequest(request *http.Request, db database.Database) (Response, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	rocRequest, err := convertRequest(request)
	if err != nil {
		return Response{}, fmt.Errorf("convert request: %w", err)
	}

	// TODO: check the refcount of the response and deallocate it if necessary.
	var responseEvents C.struct_ResponseCommands
	setRefCountToTwo(r.model)
	C.roc__mainForHost_2_caller(&rocRequest, &r.model, nil, &responseEvents)

	response := Response{
		Status:  int(responseEvents.response.status),
		Headers: toGoHeaders(responseEvents.response.headers),
		Body:    rocStrRead(responseEvents.response.body),
	}

	commands := readCommands(responseEvents.commands)
	db.Append(commands.events)
	rocEvents := convertEvents(commands.events)
	C.roc__mainForHost_0_caller(&r.model, &rocEvents, nil, &r.model)

	for _, num := range commands.printNumbers {
		fmt.Println(num)
	}

	return response, nil
}

func convertEvents(events [][]byte) C.struct_RocList {
	var str C.struct_RocStr
	elementSize := int(unsafe.Sizeof(str))
	fullSize := elementSize*len(events) + 8

	refCountPtr := roc_alloc(C.ulong(fullSize), 8)
	refCountSlice := unsafe.Slice((*uint)(refCountPtr), 1)
	refCountSlice[0] = 9223372036854775808
	startPtr := unsafe.Add(refCountPtr, 8)

	rocStrList := make([]C.struct_RocStr, len(events))
	for i, event := range events {
		rocStrList[i] = rocStrFromStr(string(event))
	}

	dataSlice := unsafe.Slice((*C.struct_RocStr)(startPtr), len(rocStrList))
	copy(dataSlice, rocStrList)

	var rocList C.struct_RocList
	rocList.len = C.ulong(len(events))
	rocList.capacity = rocList.len
	rocList.bytes = (*C.char)(unsafe.Pointer(startPtr))

	return rocList
}

type commands struct {
	events       [][]byte
	printNumbers []int
}

func readCommands(rocList C.struct_RocList) commands {
	len := rocList.len
	ptr := (*C.struct_Command)(unsafe.Pointer(rocList.bytes))
	dataSlice := unsafe.Slice(ptr, len)

	var cmds commands
	for _, cmd := range dataSlice {
		switch cmd.discriminant {
		case 0:
			payload := *(*C.struct_RocStr)(unsafe.Pointer(&cmd.payload))
			cmds.events = append(cmds.events, []byte(rocStrRead(payload)))

		case 1:
			payload := *(*C.longlong)(unsafe.Pointer(&cmd.payload))
			cmds.printNumbers = append(cmds.printNumbers, int(payload))

		default:
			panic("invalid command")
		}
	}

	return cmds
}

func convertRequest(r *http.Request) (C.struct_Request, error) {
	var rocRequest C.struct_Request

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return rocRequest, fmt.Errorf("read body: %w", err)
	}
	defer r.Body.Close()

	var requestBody C.struct_RequestBody
	requestBody.discriminant = 1
	if len(body) > 0 {

		contentType := r.Header.Get("Content-type")
		if contentType == "" {
			contentType = "text/plain"
		}

		requestBody.discriminant = 0
		var bodyMimetype C.struct_BodyMimeType
		bodyMimetype.mimeType = rocStrFromStr(contentType)
		bodyMimetype.body = rocStrFromStr(string(body))
		requestBody.payload = *(*[48]byte)(unsafe.Pointer(&bodyMimetype))
	}

	rocRequest.body = requestBody
	rocRequest.methodEnum = convertMethod(r.Method)
	rocRequest.headers = toRocHeader(r.Header)
	rocRequest.url = rocStrFromStr(r.URL.String())
	// TODO: What is a request timeout?
	rocRequest.timeout = C.struct_RequestTimeout{discriminant: 0}
	return rocRequest, nil
}

func toRocHeader(goHeader http.Header) C.struct_RocList {
	// This is only the correct len, if each header-name unique. This should be most of the time.
	headers := make([]C.struct_Header, 0, len(goHeader))
	for name, valueList := range goHeader {
		for _, value := range valueList {
			h := C.struct_Header{
				name:  rocStrFromStr(name),
				value: rocStrFromStr(value),
			}
			headers = append(headers, h)
		}
	}

	var header C.struct_Header
	elementSize := int(unsafe.Sizeof(header))
	fullSize := elementSize*len(headers) + 8

	refCountPtr := roc_alloc(C.ulong(fullSize), 8)
	refCountSlice := unsafe.Slice((*uint)(refCountPtr), 1)
	refCountSlice[0] = 9223372036854775808
	startPtr := unsafe.Add(refCountPtr, 8)

	rocStrList := make([]C.struct_Header, len(headers))
	for i, header := range headers {
		rocStrList[i] = header
	}

	dataSlice := unsafe.Slice((*C.struct_Header)(startPtr), len(rocStrList))
	copy(dataSlice, rocStrList)

	var rocList C.struct_RocList
	rocList.len = C.ulong(len(headers))
	rocList.capacity = rocList.len
	rocList.bytes = (*C.char)(unsafe.Pointer(startPtr))

	return rocList
}

func toGoHeaders(rocHeaders C.struct_RocList) []Header {
	len := rocHeaders.len
	ptr := (*C.struct_Header)(unsafe.Pointer(rocHeaders.bytes))
	headerList := unsafe.Slice(ptr, len)

	goHeader := make([]Header, len)
	for i, header := range headerList {
		goHeader[i] = Header{Name: rocStrRead(header.name), Value: rocStrRead(header.value)}
	}

	return goHeader
}

func contentType(r *http.Request, mimetype string) bool {
	return false
}

func convertMethod(method string) C.uchar {
	switch method {
	case http.MethodConnect:
		return 0
	case http.MethodDelete:
		return 1
	case http.MethodGet:
		return 2
	case http.MethodHead:
		return 3
	case http.MethodOptions:
		return 4
	case http.MethodPatch:
		return 5
	case http.MethodPost:
		return 6
	case http.MethodPut:
		return 7
	case http.MethodTrace:
		return 8
	default:
		panic("invalid method")
	}
}

// Header represents one http header.
type Header struct {
	Name  string
	Value string
}

// Response represents a http response.
type Response struct {
	Status  int
	Headers []Header
	Body    string
}

const is64Bit = uint64(^uintptr(0)) == ^uint64(0)

func rocListBytes(rocList C.struct_RocList) []byte {
	len := rocList.len
	ptr := (*byte)(unsafe.Pointer(rocList.bytes))
	return unsafe.Slice(ptr, len)
}

func rocStrFromStr(str string) C.struct_RocStr {
	// TODO: 8 only works for 64bit. Use the correct size.
	refCountPtr := roc_alloc(C.ulong(len(str)+8), 8)
	refCountSlice := unsafe.Slice((*uint)(refCountPtr), 1)
	refCountSlice[0] = 9223372036854775808 // TODO: calculate this number from the lowest int
	startPtr := unsafe.Add(refCountPtr, 8)

	var rocStr C.struct_RocStr
	rocStr.len = C.ulong(len(str))
	rocStr.capacity = rocStr.len
	rocStr.bytes = (*C.char)(unsafe.Pointer(startPtr))

	dataSlice := unsafe.Slice((*byte)(startPtr), len(str))
	copy(dataSlice, []byte(str))

	return rocStr
}

func rocStrRead(rocStr C.struct_RocStr) string {
	if int(rocStr.capacity) < 0 {
		// Small string
		ptr := (*byte)(unsafe.Pointer(&rocStr))

		byteLen := 12
		if is64Bit {
			byteLen = 24
		}

		shortStr := unsafe.String(ptr, byteLen)
		len := shortStr[byteLen-1] ^ 128
		return shortStr[:len]
	}

	// Remove the bit for seamless string
	len := (uint(rocStr.len) << 1) >> 1
	ptr := (*byte)(unsafe.Pointer(rocStr.bytes))
	return unsafe.String(ptr, len)
}

//export roc_alloc
func roc_alloc(size C.ulong, alignment int) unsafe.Pointer {
	return C.malloc(size)
}

//export roc_realloc
func roc_realloc(ptr unsafe.Pointer, newSize, _ C.ulong, alignment int) unsafe.Pointer {
	return C.realloc(ptr, newSize)
}

//export roc_dealloc
func roc_dealloc(ptr unsafe.Pointer, alignment int) {
	C.free(ptr)
}

//export roc_panic
func roc_panic(msg *C.struct_RocStr, tagID C.uint) {
	panic(fmt.Sprintf(rocStrRead(*msg)))
}

//export roc_dbg
func roc_dbg(loc *C.struct_RocStr, msg *C.struct_RocStr, src *C.struct_RocStr) {
	locStr := rocStrRead(*loc)
	msgStr := rocStrRead(*msg)
	srcStr := rocStrRead(*src)

	if srcStr == msgStr {
		fmt.Fprintf(os.Stderr, "[%s] {%s}\n", locStr, msgStr)
	} else {
		fmt.Fprintf(os.Stderr, "[%s] {%s} = {%s}\n", locStr, srcStr, msgStr)
	}
}
