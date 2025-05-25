document.addEventListener('DOMContentLoaded', function () {
            const API_BASE = 'http://localhost:4000';
            const API_VEHICULOS = `${API_BASE}/api/vehiculos`;
            const API_USUARIOS = `${API_BASE}/api/usuarios`;

            async function mostrarError(mensaje) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger';
                errorDiv.textContent = mensaje;
                document.querySelector('.container').prepend(errorDiv);
                setTimeout(() => errorDiv.remove(), 5000);
            }

            async function cargarVehiculos() {
                try {
                    const response = await fetch(API_VEHICULOS);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al cargar vehículos');
                    }

                    const vehiculos = await response.json();
                    const tbody = document.getElementById('vehiculosTable');
                    tbody.innerHTML = '';

                    vehiculos.forEach(v => {
                        const row = `<tr>
                <td>${v.placa}</td>
                <td>${v.marca}</td>
                <td>${v.modelo || 'N/A'}</td>
                <td>${v.color || 'N/A'}</td>
                <td>${v.tipo || 'N/A'}</td>
                <td>${v.propietario?.documento || 'N/A'}</td>
                <td>${v.espacioAsignado?.codigo || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-danger" 
                            onclick="registrarSalida('${v._id}')">
                        Salida
                    </button>
                </td>
            </tr>`;
                        tbody.innerHTML += row;
                    });
                } catch (error) {
                    console.error("Error detallado:", error);
                    alert("Error al cargar vehículos: " + error.message);
                }
            }

            async function registrarVehiculo(e) {
                e.preventDefault();
                const btnSubmit = e.target.querySelector('button[type="submit"]');

                try {
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';

                    const response = await fetch(API_VEHICULOS, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            placa: document.getElementById('placa').value,
                            marca: document.getElementById('marca').value,
                            modelo: document.getElementById('modelo').value,
                            color: document.getElementById('color').value,
                            tipo: document.getElementById('tipo').value,
                            propietarioDoc: document.getElementById('propietario').value
                        })
                    });

                    const resultado = await response.json();

                    if (!response.ok) {
                        if (resultado.error === 'PARQUEADERO_LLENO') {
                            throw new Error(`🚗❌ ¡Parqueadero lleno! (${resultado.ocupados}/${resultado.capacidad} ocupados)`);
                        }
                        throw new Error(resultado.message || 'Error al registrar vehículo');
                    }

                    alert(`✅ Vehículo registrado exitosamente!\nEspacio asignado: ${resultado.espacio}`);
                    document.getElementById('vehiculoForm').reset();
                    cargarVehiculos();

                } catch (error) {
                    console.error("Error:", error);
                    alert(error.message);
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Registrar';
                }
            }

            async function forzarRegistro(placa) {
                try {
                    const response = await fetch(`${API_VEHICULOS}/forzar`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                        },
                        body: JSON.stringify({ placa })
                    });

                } catch (error) {
                    console.error('Error al forzar registro:', error);
                }
            }


            document.getElementById('vehiculoForm').addEventListener('submit', registrarVehiculo);

            window.registrarSalida = async (id) => {
                if (!confirm("¿Registrar salida del vehículo?")) return;
                try {
                    const response = await fetch(`${API_VEHICULOS}/${id}/salida`, {
                        method: 'PATCH'
                    });
                    if (!response.ok) throw new Error('Error al registrar salida');
                    cargarVehiculos();
                    alert("Salida registrada");
                } catch (error) {
                    console.error("Error:", error);
                    alert("Error: " + error.message);
                }
            };

            cargarVehiculos();
        });