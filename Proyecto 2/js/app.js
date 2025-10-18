class JavaBridgeApp {
    constructor() {
        this.inicializarApp();
    }

    inicializarApp() {
        this.configurarEventos();
    }

    configurarEventos() {
        const traducirBtn = document.getElementById('traducirBtn');
        if (traducirBtn) {
            traducirBtn.addEventListener('click', () => {
                this.traducirCodigo();
            });
        }
    }

    traducirCodigo() {
        const areaTextoPython = document.getElementById('codigoPython');
        if (areaTextoPython) {
            areaTextoPython.value = "# ...";
        }
    }
}

//INICIALIZAR CUANDO EL DOM ESTE LISTO
document.addEventListener('DOMContentLoaded', () => {
    new AppJavaBridge();
});