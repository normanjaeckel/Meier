package main

/*
#cgo LDFLAGS: ./roc.o -ldl
#include "./host.h"
*/
import "C"

import (
	"fmt"
	"unsafe"
)

func main() {
	var program C.struct_Program
	C.roc__mainForHost_1_exposed_generic(&program)
	model := program.init

	fmt.Println(rocStrRead(*(*C.struct_RocStr)(model)))

	var events C.struct_RocList
	C.roc__mainForHost_0_caller(&model, &events, nil, &model)

	fmt.Println(rocStrRead(*(*C.struct_RocStr)(model)))

	fmt.Println("done")
}

type applyEventsFunc func(model unsafe.Pointer) unsafe.Pointer

const is64Bit = uint64(^uintptr(0)) == ^uint64(0)

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
