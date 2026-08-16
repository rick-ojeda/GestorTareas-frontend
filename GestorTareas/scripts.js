const lista = document.getElementById("lista");
const formulario = document.getElementById("formulario");
const encabezadoTareas = document.getElementById("encabezadoTareas");
const ingresoTareas = document.getElementById("ingresoTareas");

class GestorTareas {
    constructor() {
        this.tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    }

    guardar() {
        localStorage.setItem("tareas", JSON.stringify(this.tareas));
    }

    generarId() {
        let nuevoId = 1;

        if (this.tareas.length > 0) {
            let maxId = 0;

            for (let i = 0; i < this.tareas.length; i++) {
                if (this.tareas[i].id > maxId) {
                    maxId = this.tareas[i].id;
                }
            }

            nuevoId = maxId + 1;
        }

        return nuevoId;
    }

    agregar(descripcion, fechalimite) {
        const nuevaTarea = {
            id: this.generarId(),
            descripcion,
            fecha: new Date().toLocaleDateString("es-ES"),
            fechalimite,
            estado: true
        };
        this.tareas.push(nuevaTarea);
        this.guardar();
        return nuevaTarea;
    }

    editar(indice, descripcion, fechalimite) {
        this.tareas[indice].descripcion = descripcion;
        this.tareas[indice].fechalimite = fechalimite;
        this.guardar();
    }

    eliminar(indice) {
        this.tareas.splice(indice, 1);
        this.guardar();
    }

    cambiarEstado(indice) {
        this.tareas[indice].estado = !this.tareas[indice].estado;
        this.guardar();
    }

    obtener(indice) {
        return this.tareas[indice];
    }

    obtenerTareas() {
        return this.tareas;
    }
}

const gestor = new GestorTareas();
let nombreGuardado = localStorage.getItem("nombre");
let indiceEditar = -1;
let intervaloCuenta;

const mostrarTareas = () => {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    gestor.obtenerTareas().forEach((tarea, indice) => {
        const { id, descripcion, estado, fecha, fechalimite } = tarea;

        const tareaEstado = estado ? "Activa" : "Inactiva";
        const fechaLimite = new Date(fechalimite + "T00:00:00");
        const fechaLimiteFormateada = fechaLimite.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        lista.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <span class="badge bg-primary rounded-pill me-2">${indice + 1}</span>
                <div>
                    <span class="fw-medium">${descripcion}</span>
                    <br>
                    <small class="text-muted">
                        ID: ${id} | ${tareaEstado} | Ingreso: ${fecha} | Límite: ${fechaLimiteFormateada}
                    </small>
                </div>
            </div>
            <div>
                <button class="btn btn-info btn-sm estado" data-id="${indice}">Cambiar estado</button>
                <button class="btn btn-dark btn-sm ver-fecha" data-id="${indice}" data-bs-toggle="modal" data-bs-target="#informacionFechas">Límite de fecha</button>
                <button class="btn btn-warning btn-sm editar" data-id="${indice}">Editar</button>
                <button class="btn btn-danger btn-sm eliminar" data-id="${indice}">Eliminar</button>
            </div>
        </li>
        <div class="modal fade" id="informacionFechas" tabindex="-1" aria-labelledby="informacionFechasLabel"
                    aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="informacionFechasLabel">Fecha límite de la tarea</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Cerrar"></button>
                            </div>
                            <div class="modal-body" id="contenidoModal">
                                <!-- Aquí se carga la información dinámicamente -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>

                </div>
        `;
    });
};

const guardarTarea = () => {
    const txtTarea = document.getElementById("txtTarea");
    const txtFecha = document.getElementById("txtFecha");
    const btnGuardar = document.getElementById("btnGuardar");
    const fecha = txtFecha.value;
    const texto = txtTarea.value.trim();
    const hoy = new Date().toISOString();
    const fechaHoy = hoy.split("T")[0];

    if ((texto === "") || (fecha === "")) {
        alert("Ingrese una tarea o una fecha válida");
        return;
    }
    if (fecha < fechaHoy) {
        alert("La fecha no puede ser anterior a hoy");
        return;
    }

    if (indiceEditar === -1) {
        // Crear nueva tarea
        gestor.agregar(texto, fecha);
    } else {
        // Editar tarea existente
        gestor.editar(indiceEditar, texto, fecha);
        indiceEditar = -1;
        btnGuardar.textContent = "Guardar";
    }

    alert("Ingresando datos");
    setTimeout(() => {
        mostrarTareas();
        alert("Datos ingresados");
    }, 2000);

    txtTarea.value = "";
    txtFecha.value = "";
};

const guardarNombre = () => {
    const txtNombre = document.getElementById("txtNombre");
    const nombre = txtNombre.value.trim();

    if (nombre === "") {
        alert("Por favor ingrese su nombre");
        return;
    }

    localStorage.setItem("nombre", nombre);
    nombreGuardado = nombre;
    cargarPagina();
};

const cargarPagina = () => {
    formulario.innerHTML = `
        <input id="txtNombre" class="form-control form-control-lg" type="text"
               readonly placeholder="Bienvenido ${nombreGuardado}">
        <button id="btnSalir" class="btn btn-danger salir">Salir</button>
    `;

    const cuadroTareas = document.getElementById("cuadroTareas");

    cuadroTareas.innerHTML = `
        <div class="card shadow">
            <div class="card-header bg-primary text-white" id="encabezadoTareas">
                <h3 class="text-center mb-0">Lista de tareas de ${nombreGuardado}</h3>
            </div>
            <div class="card-body" id="ingresoTareas">
                <div class="input-group mb-3">
                    <label for="txtTarea">Ingrese una tarea
                    <input type="text" id="txtTarea" class="form-control" placeholder="Nombre de la tarea">
                    </label>
                    <label for="txtFecha">Ingrese la fecha limite
                    <input type="date" id="txtFecha" class="form-control" placeholder="Ingrese dia">
                    </label>
                    <button id="btnGuardar" class="btn btn-success ms-auto">Guardar</button>
                </div>
                <hr>
                <ul id="lista" class="list-group"></ul>
            </div>
        </div>
    `;

    // Asignar eventos a los nuevos elementos
    document.getElementById("btnGuardar").addEventListener("click", guardarTarea);
    document.getElementById("btnSalir").addEventListener("click", salir);

    // Eventos de la lista (editar, eliminar, estado)
    document.getElementById("lista").addEventListener("click", (e) => {
        const indice = e.target.dataset.id;

        if (e.target.classList.contains("eliminar")) {
            gestor.eliminar(indice);
            mostrarTareas();
        }

        if (e.target.classList.contains("editar")) {
            const txtTarea = document.getElementById("txtTarea");
            const btnGuardar = document.getElementById("btnGuardar");
            const txtFecha = document.getElementById("txtFecha");
            const tarea = gestor.obtener(indice);

            txtFecha.value = tarea.fechalimite;
            txtTarea.value = tarea.descripcion;
            indiceEditar = indice;
            btnGuardar.textContent = "Actualizar";
        }

        if (e.target.classList.contains("estado")) {
            gestor.cambiarEstado(indice);
            mostrarTareas();
        }

        if (e.target.classList.contains("ver-fecha")) {
            const tarea = gestor.obtener(indice);

            const fechaLimite = new Date(tarea.fechalimite + "T00:00:00");
            const activa = tarea.estado;
            const txtFechaLimite = fechaLimite.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            if (intervaloCuenta) {
                clearInterval(intervaloCuenta);
            }

            if (activa)
            {    
            document.getElementById("contenidoModal").innerHTML = `
                <p><strong>Tarea:</strong> ${tarea.descripcion}</p>
                <p><strong>Fecha Ingreso:</strong> ${tarea.fecha}</p>
                <p><strong>Fecha límite:</strong> ${txtFechaLimite}</p>
                <hr>
                <p><strong>Tiempo restante:</strong></p>
                <h4 id="cuentaRegresiva" class="text-primary"></h4>
            `;
            }
            else {
            document.getElementById("contenidoModal").innerHTML = `
                <p><strong>Tarea:</strong> ${tarea.descripcion}</p>
                <p><strong>Fecha Ingreso:</strong> ${tarea.fecha}</p>
                <p><strong>Fecha límite:</strong> ${txtFechaLimite}</p>
                <hr>
                <p><strong>Esta tarea esta inactiva.</strong></p>
                
            `;
                
            }

            const cuenta = document.getElementById("cuentaRegresiva");

            const actualizar = () => {
                const diferencia = fechaLimite - new Date();

                if (diferencia <= 0) {
                    cuenta.innerHTML = "Ya se cumplio la fecha limite de esta tarea.";
                    clearInterval(intervaloCuenta);
                    return;
                }

                const totalSegundos = Math.floor(diferencia / 1000);

                const dias = Math.floor(totalSegundos / (60 * 60 * 24));
                const horas = Math.floor((totalSegundos % (60 * 60 * 24)) / (60 * 60));
                const minutos = Math.floor((totalSegundos % (60 * 60)) / 60);
                const segundos = totalSegundos % 60;

                cuenta.innerHTML = dias + " días, " + horas + " horas, " + minutos + " minutos, " + segundos + " segundos";
            };

            actualizar();
            intervaloCuenta = setInterval(actualizar, 1000);
        }
    });

    mostrarTareas();
};

// ======================
// 8. SALIR
// ======================
const salir = () => {
    let respuesta = confirm("¿Desea salir de la aplicacion?");
    if (respuesta) {
        localStorage.clear();
        location.reload();
    }
};

if (nombreGuardado) {
    cargarPagina();
} else {
    document.getElementById("btnContinuar").addEventListener("click", guardarNombre);
}