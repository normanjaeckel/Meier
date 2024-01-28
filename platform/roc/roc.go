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
		Status: int(response.status),
		// TODO: Headers: response.headers,
		Body: rocStrRead(response.body),
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
	var responseEvents C.struct_ResponseEvents
	setRefCountToTwo(r.model)
	C.roc__mainForHost_2_caller(&rocRequest, &r.model, nil, &responseEvents)

	response := Response{
		Status: int(responseEvents.response.status),
		// TODO: Headers: responseEvents.response.headers,
		Body: rocStrRead(responseEvents.response.body),
	}

	goEvents := readEvents(responseEvents.events)
	db.Append(goEvents)

	C.roc__mainForHost_0_caller(&r.model, &responseEvents.events, nil, &r.model)

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

func readEvents(rocList C.struct_RocList) [][]byte {
	len := rocList.len
	ptr := (*C.struct_RocStr)(unsafe.Pointer(rocList.bytes))
	dataSlice := unsafe.Slice(ptr, len)

	events := make([][]byte, len)
	for i, rocEvent := range dataSlice {
		events[i] = []byte(rocStrRead(rocEvent))
	}

	return events
}

func convertRequest(r *http.Request) (C.struct_Request, error) {
	var rocRequest C.struct_Request

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return rocRequest, fmt.Errorf("read body: %w", err)
	}
	defer r.Body.Close()

	rocRequest.body = rocStrFromStr(string(body))
	rocRequest.methodEnum = convertMethod(r.Method)
	// TODO rocRequest.headers = request.Headers
	rocRequest.url = rocStrFromStr(r.URL.String())
	return rocRequest, nil
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
