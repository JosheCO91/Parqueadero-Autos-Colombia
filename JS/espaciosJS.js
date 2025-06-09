const API_BASE = 'http://localhost:4000';
const API_ESPACIOS = `${API_BASE}/api/espacios`;

document.addEventListener('DOMContentLoaded', function () {
    cargarEspacios();
});

async function crearEspaciosIniciales() {
    try {

        for (let i = 1; i <= 10; i++) {
            await Espacio.create({
                codigo: `C${i}`,
                tipo: 'carro'
            });
        }


        for (let i = 1; i <= 5; i++) {
            await Espacio.create({
                codigo: `M${i}`,
                tipo: 'moto'
            });
        }

        console.log('15 espacios creados exitosamente');
    } catch (err) {
        console.error('Error al crear espacios:', err);
    }
}

async function cargarEspacios() {
    try {
        const response = await fetch(`${API_BASE}/api/espacios`);
        if (!response.ok) throw new Error('Error al cargar espacios');

        const espacios = await response.json();


        const total = espacios.length;
        const disponibles = espacios.filter(e => e.estado === 'disponible').length;
        const ocupados = espacios.filter(e => e.estado === 'ocupado').length;

        document.getElementById('totalEspacios').textContent = total;
        document.getElementById('espaciosDisponibles').textContent = disponibles;
        document.getElementById('espaciosOcupados').textContent = ocupados;


        if (total >= 15 && disponibles === 0) {
            alert('¡Parqueadero lleno! No se pueden registrar más vehículos hasta que salga alguno.');
        }


        const grid = document.getElementById('espaciosGrid');
        grid.innerHTML = '';

        espacios.forEach(espacio => {
            const card = document.createElement('div');
            card.className = `col-md-3 mb-3 espacio-card ${espacio.estado}`;
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5>Espacio ${espacio.codigo}</h5>
                        <p><strong>Tipo:</strong> ${espacio.tipo}</p>
                        <p><strong>Estado:</strong> ${espacio.estado}</p>
                        ${espacio.vehiculo ? `
                            <p><strong>Vehículo:</strong> ${espacio.vehiculo.placa}</p>
                            <button class="btn btn-sm btn-danger" 
                                    onclick="liberarEspacio('${espacio._id}')">
                                Registrar salida
                            </onclick=>
                        ` : '<p class="text-success">Disponible</p>'}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        alert("Error al cargar espacios");
    }
}

function actualizarResumen(espacios) {
    document.getElementById('totalEspacios').textContent = espacios.length;
    document.getElementById('espaciosDisponibles').textContent =
        espacios.filter(e => e.estado === 'disponible').length;
    document.getElementById('espaciosOcupados').textContent =
        espacios.filter(e => e.estado === 'ocupado').length;
}

function renderizarEspacios(espacios) {
    const grid = document.getElementById('espaciosGrid');
    grid.innerHTML = '';

    espacios.forEach(espacio => {
        const espacioCard = document.createElement('div');
        espacioCard.className = `col-md-3 espacio-card ${espacio.estado}`;

        let vehiculoInfo = 'Libre';
        if (espacio.vehiculo) {
            vehiculoInfo = `
                        <strong>Vehículo:</strong> ${espacio.vehiculo.placa}<br>
                        <strong>Dueño:</strong> ${espacio.vehiculo.propietario?.documento || 'N/A'}
                    `;
        }

        espacioCard.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">Espacio ${espacio.codigo}</h5>
                            <p class="card-text">
                                <strong>Tipo:</strong> ${espacio.tipo}<br>
                                <strong>Estado:</strong> ${espacio.estado}<br>
                                ${vehiculoInfo}
                            </p>
                        </div>
                        <div class="card-footer bg-transparent">
                            ${espacio.estado === 'disponible' ?
                '<button class="btn btn-sm btn-success" disabled>Disponible</button>' :
                '<button class="btn btn-sm btn-danger" onclick="liberarEspacio(\'' + espacio._id + '\')">Liberar</button>'}
                        </div>
                    </div>
                `;

        grid.appendChild(espacioCard);
    });
}

async function liberarEspacio(espacioId) {
    if (!confirm('¿Registrar salida y generar pago?')) return;

    try {
        const response = await fetch(`${API_ESPACIOS}/${espacioId}/liberar`, {
            method: 'PATCH' 
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al preparar pago');
        }

        const data = await response.json();
        
        if (!data.vehiculoInfo) {
            await fetch(`${API_ESPACIOS}/${espacioId}/confirmar-pago`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metodoPago: 'sin_vehiculo', pagoData: null })
            });
            return cargarEspacios();
        }

        document.getElementById('vehiculoInfo').textContent = 
            `${data.vehiculoInfo.placa} (${data.vehiculoInfo.tipo})`;
        document.getElementById('propietarioInfo').textContent = 
            `${data.propietarioInfo.nombre} (${data.propietarioInfo.documento})`;
        document.getElementById('tarifaBase').textContent = 
            `$${data.pagoData.tarifaBase.toLocaleString()}`;
        document.getElementById('totalPago').textContent = 
            `$${data.pagoData.total.toLocaleString()}`;
        document.getElementById('espacioId').value = espacioId;
        document.getElementById('pagoData').value = JSON.stringify(data.pagoData);

        const pagoModal = new bootstrap.Modal(document.getElementById('pagoModal'));
        pagoModal.show();

    } catch (error) {
        console.error("Error:", error);
        alert("Error al preparar pago: " + error.message);
    }
}

async function confirmarPago() {
    const metodoPago = document.getElementById('metodoPago').value;
    const espacioId = document.getElementById('espacioId').value;
    const pagoData = JSON.parse(document.getElementById('pagoData').value);

    if (!metodoPago) {
        alert('Seleccione un método de pago');
        return;
    }

    try {
        const response = await fetch(`${API_ESPACIOS}/${espacioId}/confirmar-pago`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                metodoPago,
                pagoData
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al confirmar pago');
        }

        const pagoModal = bootstrap.Modal.getInstance(document.getElementById('pagoModal'));
        pagoModal.hide();

        alert('Pago registrado y espacio liberado con éxito');
        cargarEspacios();

        if (typeof cargarPagos === 'function') {
            cargarPagos();
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error al confirmar pago: " + error.message);
    }
}

function calcularTarifa(tipoVehiculo, tipoUsuario) {
    const tarifas = {
        carro: {
            normal: 80000,
            mensual: 500000,
            horas: 5000
        },
        moto: {
            normal: 40000,
            mensual: 250000,
            horas: 3000
        }
    };
    return tarifas[tipoVehiculo][tipoUsuario] || tarifas[tipoVehiculo].normal;
}

function calcularTotal(tipoVehiculo, tipoUsuario, fechaEntrada) {
    const tarifaBase = calcularTarifa(tipoVehiculo, tipoUsuario);
    if (tipoUsuario === 'horas') {
        const horas = (new Date() - new Date(fechaEntrada)) / (1000 * 60 * 60);
        return Math.ceil(horas) * tarifaBase;
    }
    return tarifaBase;
}

async function confirmarPago() {
    const metodoPago = document.getElementById('metodoPago').value;
    const espacioId = document.getElementById('espacioId').value;
    const pagoData = JSON.parse(document.getElementById('pagoData').value);

    if (!metodoPago) {
        alert('Seleccione un método de pago');
        return;
    }

    try {
        const response = await fetch(`${API_ESPACIOS}/${espacioId}/confirmar-pago`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                metodoPago,
                pagoData
            })
        });

        if (!response.ok) throw new Error('Error al confirmar pago');

        const result = await response.json();

        const pagoModal = bootstrap.Modal.getInstance(document.getElementById('pagoModal'));
        pagoModal.hide();

        alert('Pago registrado y espacio liberado con éxito');
        cargarEspacios();
    } catch (error) {
        console.error("Error:", error);
        alert("Error al confirmar pago: " + error.message);
    }
}


