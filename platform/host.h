#include <stdlib.h>

struct RocStr {
    char* bytes;
    size_t len;
    size_t capacity;
};

struct RocList {
    char* bytes;
    size_t len;
    size_t capacity;
};

struct Program {
    void* init;
    void* applyEvents;
};

extern void roc__mainForHost_1_exposed_generic(const struct Program *program);

extern void roc__mainForHost_0_caller(void* *model,  const struct RocList *events, void* something,void* *newModel );
