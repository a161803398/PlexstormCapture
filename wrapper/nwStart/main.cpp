#include <windows.h>
int main() {
    unsigned int result = WinExec("bin/nw.exe", 0);
    switch(result) {
    case ERROR_BAD_FORMAT:
        MessageBox(NULL, "bin/nw.exe is invalid.", "Fatal Error", MB_ICONERROR);
        return 1;
    case ERROR_FILE_NOT_FOUND:
    case ERROR_PATH_NOT_FOUND:
        MessageBox(NULL, "bin/nw.exe was not found.", "Fatal Error", MB_ICONERROR);
        return 1;
    }
    return 0;
}
