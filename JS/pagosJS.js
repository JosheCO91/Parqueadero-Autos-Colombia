document.addEventListener('DOMContentLoaded', function () {

            const TARIFA_POR_HORA = 2000;


            document.getElementById('tiempo').addEventListener('change', function () {
                const horas = parseInt(this.value) || 1;
                document.getElementById('monto').value = horas * TARIFA_POR_HORA;
            });


            cargarPagos();


            document.getElementById('pagoForm').addEventListener('submit', function (e) {
                e.preventDefault();

                const placa = document.getElementById('placa').value;
                const tiempo = document.getElementById('tiempo').value;
                const monto = document.getElementById('monto').value;


                setTimeout(() => {

                    const tbody = document.getElementById('pagosTable');
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${new Date().toLocaleString()}</td>
                        <td>${placa}</td>
                        <td>${tiempo}</td>
                        <td>$${monto}</td>
                    `;
                    tbody.insertBefore(tr, tbody.firstChild);


                    document.getElementById('placa').value = '';
                    document.getElementById('tiempo').value = '1';
                    document.getElementById('monto').value = '2000';

                    alert('Pago registrado (simulado)');
                }, 500);
            });


            function cargarPagos() {
                const pagosEjemplo = [
                    { fecha: '2023-05-15T10:30:00', placa: 'ABC123', tiempo: 2, monto: 4000 },
                    { fecha: '2023-05-14T15:45:00', placa: 'XYZ789', tiempo: 1, monto: 2000 }
                ];

                const tbody = document.getElementById('pagosTable');
                pagosEjemplo.forEach(pago => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${new Date(pago.fecha).toLocaleString()}</td>
                        <td>${pago.placa}</td>
                        <td>${pago.tiempo}</td>
                        <td>$${pago.monto}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        });