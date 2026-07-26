!include "nsProcess.nsh"

!macro customCheckAppRunning
  ${nsProcess::FindProcess} "${PRODUCT_FILENAME}.exe" $R0
  ${If} $R0 == 0
    ${If} ${Silent}
      SetErrorLevel 1
      Quit
    ${EndIf}
    MessageBox MB_OK|MB_ICONEXCLAMATION "$(appAlreadyRunning)" /SD IDOK
    Abort
  ${EndIf}
!macroend

!macro uninstallApp
  ExecWait '"$INSTDIR\${PRODUCT_FILENAME}.exe" --uninstall'
!macroend

!macro customInstallCleanup
  !insertmacro uninstallApp
!macroend
