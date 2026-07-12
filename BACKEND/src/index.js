//--------- INICIAR SERVIDOR ----------
const app = require("./app");

app.listen(app.get('port'), () => {
    console.log("Servidor iniciado en el puerto", app.get('port'));
});