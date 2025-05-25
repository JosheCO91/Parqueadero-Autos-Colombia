document.addEventListener('DOMContentLoaded', function () {

            cargarUsuarios();

            document.getElementById('saveUsuario').addEventListener('click', guardarUsuario);
        });

        async function cargarUsuarios() {
            try {
                const response = await fetch('http://localhost:4000/api/usuarios');
                const usuarios = await response.json();

                const tableBody = document.getElementById('usuariosTable');
                tableBody.innerHTML = '';

                usuarios.forEach(usuario => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${usuario.nombre}</td>
                        <td>${usuario.documento}</td>
                        <td>${usuario.telefono}</td>
                        <td>${usuario.tipo === 'mensual' ? 'Mensual' : 'Ocasional'}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${usuario._id}')">
                                Eliminar
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
            }
        }

        async function guardarUsuario() {
            const usuarioData = {
                nombre: document.getElementById('nombre').value,
                documento: document.getElementById('documento').value,
                telefono: document.getElementById('telefono').value,
                tipo: document.getElementById('tipo').value
            };

            try {
                const response = await fetch('http://localhost:4000/api/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(usuarioData)
                });

                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }

                const data = await response.json();
                console.log('Usuario guardado:', data);

                const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
                modal.hide();
                cargarUsuarios();

                document.getElementById('usuarioForm').reset();

            } catch (error) {
                console.error('Error al guardar:', error);
                alert('Error al conectar con el servidor. Verifica: \n1. Que el servidor esté corriendo\n2. La consola para más detalles');
            }
        }

        async function eliminarUsuario(id) {
            if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

            try {
                const response = await fetch(`/api/usuarios/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    cargarUsuarios();
                } else {
                    const error = await response.json();
                    alert(error.message || 'Error al eliminar el usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        }