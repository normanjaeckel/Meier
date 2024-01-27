TODO: Write me in a task

// Important! the .o file has to be removed, or it (sometimes) does not recreate it.
roc build example/main.roc --no-link --output roc.o
go build && ./webserver
