@echo off
REM Vérifier le paramètre
IF "%1"=="" (
echo joel pardon concentre toi et spécifie une action : MISE_A_JOUR pour mise a jour, RESTAURATION pour restauration
pause
exit /b
)

REM Action mise à jour
IF /I "%1"=="MISE_A_JOUR" (
echo Mise a jour du dépôt...
git add .
git commit -m "mise a jour"
git push
echo Mise a jour terminee.
pause
exit /b
)

REM Action restauration depuis VS Code
IF /I "%1"=="RESTAURATION" (
echo Recuperation des dernieres modifications depuis GitHub...
git pull
echo Restauration terminee.
pause
exit /b
)

REM Si paramètre non reconnu
echo Action non reconnue. joel toi aussi Utilise MISE_A_JOUR pour mise a jour ou RESTAURATION pour restauration.
pause