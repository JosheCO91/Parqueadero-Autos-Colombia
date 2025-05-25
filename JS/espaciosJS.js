const API_BASE = 'http://localhost:4000';
        const API_ESPACIOS = `${API_BASE}/api/espacios`;

        document.addEventListener('DOMContentLoaded', function () {
            cargarEspacios();
        });
        async function inicializarEspacios() {
            try {

                const response = await fetch(`${API_BASE}/api/espacios/verificar-espacios`);
                const data = await response.json();

                if (data.totalEspacios === 0) {

                    const initResponse = await fetch(`${API_BASE}/api/espacios/inicializar`, {
                        method: 'POST'
                    });

                    if (!initResponse.ok) {
                        throw new Error('Error al crear espacios iniciales');
                    }

                    alert('15 espacios iniciales creados (10 carros, 5 motos)');
                }

                cargarEspacios();
            } catch (error) {
                console.error("Error:", error);
                alert("Error al inicializar espacios: " + error.message);
            }
        }


        document.addEventListener('DOMContentLoaded', function () {
            inicializarEspacios();
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
                                    onclick="registrarSalida('${espacio.vehiculo._id}')">
                                Registrar salida
                            </button>
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

        async function registrarSalida(vehiculoId) {
            if (!confirm('¿Registrar salida de este vehículo?')) return;

            try {
                const response = await fetch(`${API_BASE}/api/vehiculos/${vehiculoId}/salida`, {
                    method: 'PATCH'
                });

                if (!response.ok) throw new Error('Error al registrar salida');

                alert('Salida registrada correctamente');
                cargarEspacios();
            } catch (error) {
                console.error("Error:", error);
                alert("Error al registrar salida: " + error.message);
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
            if (!confirm('¿Liberar este espacio?')) return;

            try {
                const response = await fetch(`${API_ESPACIOS}/${espacioId}/liberar`, {
                    method: 'PATCH'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                alert('Espacio liberado con éxito');
                cargarEspacios();
            } catch (error) {
                console.error("Error:", error);
                alert("Error al liberar espacio: " + error.message);
            }
        }


