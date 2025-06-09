const API_BASE = 'http://localhost:4000';

document.addEventListener('DOMContentLoaded', function() {
    cargarPagos();
});

async function cargarPagos() {
    try {
        console.log("Intentando cargar pagos...");
        const response = await fetch(`${API_BASE}/api/pagos`);
        console.log("Respuesta recibida:", response);
        
        const responseText = await response.text();
        console.log("Respuesta como texto:", responseText);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const pagos = responseText ? JSON.parse(responseText) : [];
        console.log("Datos parseados:", pagos);
        
        if (!Array.isArray(pagos)) {
            throw new Error('La respuesta no contiene un array de pagos');
        }

        const tableConfig = {
            destroy: true,
            data: pagos,
            columns: [
                { 
                    data: 'fechaSalida', 
                    render: function(data) {
                        return data ? new Date(data).toLocaleString() : 'N/A';
                    }
                },
                { 
                    data: 'vehiculo',
                    render: function(data) {
                        if (!data) return 'N/A';
                        return typeof data === 'object' ? data.placa : data;
                    }
                },
                { 
                    data: 'propietario',
                    render: function(data) {
                        if (!data) return 'N/A';
                        return typeof data === 'object' ? data.nombre : data;
                    }
                },
                { 
                    data: 'espacio',
                    render: function(data) {
                        if (!data) return 'N/A';
                        return typeof data === 'object' ? data.codigo : data;
                    }
                },
                { 
                    data: 'tarifaBase', 
                    render: function(data) {
                        return data ? `$${parseInt(data).toLocaleString()}` : 'N/A';
                    }
                },
                { 
                    data: 'total', 
                    render: function(data) {
                        return data ? `$${parseInt(data).toLocaleString()}` : 'N/A';
                    }
                },
                { 
                    data: 'metodoPago',
                    defaultContent: 'N/A'
                }
            ],
            language: {
                "decimal": "",
                "emptyTable": "No hay pagos registrados",
                "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                "infoEmpty": "Mostrando 0 a 0 de 0 registros",
                "infoFiltered": "(filtrado de _MAX_ registros totales)",
                "infoPostFix": "",
                "thousands": ",",
                "lengthMenu": "Mostrar _MENU_ registros",
                "loadingRecords": "Cargando...",
                "processing": "Procesando...",
                "search": "Buscar:",
                "zeroRecords": "No se encontraron pagos coincidentes",
                "paginate": {
                    "first": "Primero",
                    "last": "Último",
                    "next": "Siguiente",
                    "previous": "Anterior"
                }
            }
        };

        $('#pagosTable').DataTable(tableConfig);

    } catch (error) {
        console.error("Error completo:", error);
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'alert alert-danger mt-3';
        errorContainer.innerHTML = `
            <h4>Error al cargar pagos</h4>
            <p>${error.message}</p>
            <p>Por favor verifica que el servidor esté funcionando correctamente.</p>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(errorContainer);
        }
        
        $('#pagosTable').DataTable({
            language: {
            }
        });
    }
}
        

    