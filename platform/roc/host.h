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

union CommandUnion {
    struct RocStr addEvent;
    long long int printTheNumber;
};

struct Command {
    union CommandUnion payload;
    unsigned char discriminant;
};

struct Request {
    struct RocStr body;
    struct RocList headers;
    struct RocStr url;
    unsigned char methodEnum; 
};

struct Response {
    struct RocStr body;
    struct RocList headers;
    short unsigned int status;
};

struct ResponseCommands {
    struct Response response;
    struct RocList commands;
};

extern void roc__mainForHost_1_exposed_generic(const struct Program *program);

// applyEvents
extern void roc__mainForHost_0_caller(void* *model, const struct RocList *events, void* something, void* *newModel );

// handleReadRequest
extern void roc__mainForHost_1_caller(const struct Request *request, void* *model,  void* something, const struct Response *response );

// handleWriteRequest
extern void roc__mainForHost_2_caller(const struct Request *request, void* *model,  void* something, const struct ResponseCommands *responseEvents );
