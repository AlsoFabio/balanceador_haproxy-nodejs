const { execSync } = require('child_process');
const fs = require('fs');

const funciones = {
    ps: () => {
        // Ejecutar el comando de Docker y obtener la salida --------------------------------
        const output = execSync('docker ps --filter "name=web"').toString();

        // Separar la salida en líneas
        const lines = output.split('\n');

        // Inicializar un arreglo para guardar los números
        const numbers = [];

        // Procesar cada línea
        lines.forEach(line => {
            // Utilizar una expresión regular para extraer el número del nombre
            const match = line.match(/web(\d+)/);
            if (match) {
                // Obtener el número del grupo de captura
                const number = parseInt(match[1]);
                numbers.push(number);
            }
        });
        numbers.sort((a, b) => a - b);
        return numbers
    },
    // Función para encontrar el primer número faltante
    findMissingNumber: (numbers) => {
        let missingNumber = 1;
        for (const number of numbers) {
            if (number === missingNumber) {
                missingNumber++;
            } else {
                break;
            }
        }
        return missingNumber;
    },
    nuevoContenedor: () => {
        // Encontrar el primer número faltante
        const missingNumber = funciones.findMissingNumber(funciones.ps());
        if (missingNumber === undefined) {
            missingNumber = 1;
        }
        // Crear un nuevo contenedor con el nombre "web" + el número faltante
        const newContainerName = `web${missingNumber}`;
        console.log(`Creando un nuevo contenedor con el nombre: ${newContainerName}.${missingNumber}`);

        const mysqlHost = 'mysql-1'; // Cambia esto a la dirección correcta del host MySQL
        const mysqlRootPassword = '1234'; // Cambia esto a la contraseña correcta

        // Ejecutar el comando de Docker para crear el nuevo contenedor
        execSync(`docker run -d -e MYSQL_HOST=${mysqlHost} -e MYSQL_ROOT_PASSWORD=${mysqlRootPassword} --name ${newContainerName} apachito`);
        
        return newContainerName
    },
    // Función para eliminar un contenedor con un número aleatorio
    borrarAleatorio: () => {

        // Obtener la lista de números de contenedores
        const containerNumbers = funciones.ps();

        // Verificar si hay números disponibles
        if (containerNumbers.length === 1) {
            console.log('No se puede eliminar el ultimo contenedor');
            return;
        }

        // Generar un número aleatorio entre 0 y la longitud del arreglo
        const randomIndex = Math.floor(Math.random() * containerNumbers.length);

        // Obtener el número aleatorio
        const randomNumber = containerNumbers[randomIndex];

        // Construir el nombre del contenedor
        const containerName = `web${randomNumber}`;

        // Ejecutar el comando para eliminar el contenedor
        try {
            execSync(`docker rm -f ${containerName}`);
            console.log(`Contenedor ${containerName} eliminado exitosamente.`);
        } catch (error) {
            console.error(`Error al eliminar el contenedor ${containerName}: ${error.message}`);
        }
    },
    agregarAlBalanceador: () => {
        // Ruta al archivo .cfg que deseas reescribir
        const filePath = 'C:/Users/Usuario/Desktop/Materias/seminario de actualizacion/trabajo5/haproxy/haproxy.cfg';
        // Obtener la lista de contenedores
        const contenedores = funciones.ps();
        const ips = [];

        for (const contenedor of contenedores) {
            const ipweb = execSync(`docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" web${contenedor}`).toString().trim();
            ips.push(ipweb);
        }
        console.log(ips);
        // Construir el contenido completo del archivo .cfg
        let yamlContent = `global
    log /dev/log local0
    log /dev/log local1 notice
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend http_front
    bind *:80
    stats uri /haproxy?stats
    default_backend http_back

backend http_back
    balance roundrobin`;

        ips.forEach((ip, index) => {
            // Agregar el servidor para cada contenedor al contenido completo
            yamlContent += `
    server web${index+1} ${ip}:80 check port 80`;
        });
        yamlContent += `

`;

        // Escribir el contenido completo en el archivo .cfg (reemplazando el contenido existente)
        fs.writeFileSync(filePath, yamlContent);

        console.log(`Balanceador reescrito con éxito.`);
        execSync(`docker restart haproxyFan`)
    },
}

module.exports = funciones;