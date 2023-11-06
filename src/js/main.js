// Variables globales
let formattedPriceETH;
let formattedAccountBalance;
let errorCodeMeta;

if (window.ethereum) {

    // Obtén la instancia de WEB3
    window.web3 = new Web3(window.ethereum);

    // Obtén la instancia del contrato PriceFeed
    const contractABIPriceFeed = contractPriceFeedSettings.abi;
    const contractAddressPriceFeed = contractPriceFeedSettings.address;
    window.contractInstancePriceFeed = new window.web3.eth.Contract(contractABIPriceFeed, contractAddressPriceFeed);

    // Obtén la instancia del contrato CryptoSavings
    const contractABICryptoSavings = contractCryptoSavingsSettings.abi;
    const contractAddressCryptoSavings = contractCryptoSavingsSettings.address;
    window.contractInstanceCryptoSavings = new window.web3.eth.Contract(contractABICryptoSavings, contractAddressCryptoSavings);

    // Funcion Conectar
    loadInitialData();

} else {
    // MetaMask no está instalado
    document.getElementById("mainScreen").style.display = "none";
    document.getElementById('textAlert').textContent = "MetaMask no está instalado en tu navegador.";
    errorCodeMeta = 1;
}

async function connect() {

    try {
        const unlocked = await window.ethereum._metamask.isUnlocked();
        if (!unlocked) {
            // MetaMask está desbloqueado
            document.getElementById("mainScreen").style.display = "none";
            document.getElementById("offLineScreen").style.display = "block";
            document.getElementById('textAlert').textContent = "Desbloquea MetaMask para continuar.";
            errorCodeMeta = 2;
            //await window.ethereum.request({ method: 'eth_requestAccounts' });
            return false;
        }

        if (!window.ethereum.isConnected()) {
            // El proveedor no está conectado
            document.getElementById("mainScreen").style.display = "none";
            document.getElementById("offLineScreen").style.display = "block";
            document.getElementById('textAlert').textContent = "MetaMask no esta conectado a la red.";
            errorCodeMeta = 3;
            return false;
        }

        if (window.ethereum.selectedAddress === null){
            // Ninguna cuenta conectada con el sitio
            document.getElementById("mainScreen").style.display = "none";
            document.getElementById("offLineScreen").style.display = "block";
            document.getElementById('textAlert').textContent = "Enlaza tu cuenta a la pagina.";
            errorCodeMeta = 4;
            //await window.ethereum.request({ method: 'eth_requestAccounts' });
            return false;
        }

        if (ethereum.chainId === '0x5' || ethereum.chainId === '5') {
            // La red actual es Goerli (0x5 o 5)            
            document.getElementById("mainScreen").style.display = "block";
            document.getElementById("offLineScreen").style.display = "none";
            errorCodeMeta = 0;
            return true;
        } else {
            // La red no es Goerli
            document.getElementById("mainScreen").style.display = "none";
            document.getElementById("offLineScreen").style.display = "block";
            document.getElementById('textAlert').textContent = "Cambia a la red Goerli en MetaMask.";
            errorCodeMeta = 5;
            return false;
        }

    } catch (error) {
        console.error('Error al verificar MetaMask:', error);
        return false;
    }
}

async function updatePrice() {

    try {
        // Llama a la función del contrato para obtener los precios
        const ethData = await window.contractInstancePriceFeed.methods.get_ETH_USD_Data().call();

        // Formatear el precio para mostrarlo con 2 decimales
        formattedPriceETH = (ethData.answer / 10 ** ethData.decimals).toFixed(2);

    } catch (error) {
        console.error('Error al actualizar los precios:', error);
    }
}

async function getBalanceAccount() {

    try {
        // Llama a la función del contrato para obtener los precios
        const accountBalance = await window.contractInstanceCryptoSavings.methods.getBalance().call({ from: window.ethereum.selectedAddress });

        // Formatea el balance para mostrarlo en ether
        formattedAccountBalance = web3.utils.fromWei(accountBalance, 'ether');

    } catch (error) {
        console.error('Error al obtener el balance de la cuenta:', error);
    }
}

// Evento click botón Depositar
document.getElementById('depositButton').addEventListener('click', async function () {

    try {
        const inputValue = document.getElementById('inputDeposit').value;

        // Convierte el valor de Ether a Wei
        const weiValue = web3.utils.toWei(inputValue, 'ether');

        // Asegúrate de que window.contractInstanceCryptoSavings sea una instancia válida del contrato
        if (window.contractInstanceCryptoSavings) {

            await window.contractInstanceCryptoSavings.methods.deposit().send({ from: window.ethereum.selectedAddress, value: weiValue });

            // Oculta el modal y actualiza la interfaz
            $('#depositModal').modal('hide');

            document.getElementById('inputDeposit').value = "";

        } else {
            console.error('La instancia del contrato no es válida.');
        }

    } catch (error) {
        console.error('Error al apretar el botón depositar:', error);
    }
});


// Evento click botón Retirar
document.getElementById('withdrawButton').addEventListener('click', async function () {

    try {

        const inputValue = document.getElementById('inputWithdraw').value;

        if (inputValue > formattedAccountBalance) {

            document.getElementById("textAlertRetiro").style.display = "block";
            document.getElementById('textAlertRetiro').textContent = "El monto supera sus depositos.";

        } else {

            // Convierte el valor de Ether a Wei
            const weiValue = web3.utils.toWei(inputValue, 'ether');

            // Asegúrate de que window.contractInstanceCryptoSavings sea una instancia válida del contrato
            if (window.contractInstanceCryptoSavings) {

            await window.contractInstanceCryptoSavings.methods.withdraw(weiValue).send({ from: window.ethereum.selectedAddress });

            // Oculta el modal y actualiza la interfaz
            $('#withdrawModal').modal('hide');

            document.getElementById('inputWithdraw').value = "";

            } else {
                console.error('La instancia del contrato no es válida.');
            }

        }

    } catch (error) {
        console.error('Error al apretar el botón retirar:', error);
    }

});

// Evento click botón Conectar
document.getElementById('connectMetaMasckButton').addEventListener('click', async function () {

// 0-OK, 1-MetaMask no instalado, 2-Cuenta bloqueda, 3-Red no cenectada, 4-Cuenta no conctada a la pagina, 5-Red no es Goerli

    if (errorCodeMeta ===1) {
        try {
            // Crear un elemento <a> con la URL y el atributo target
            const newTab = document.createElement('a');
            newTab.href = 'https://metamask.io/'; // Reemplaza con tu URL
            newTab.target = '_blank';
            // Simular un clic en el enlace para abrirlo en una nueva pestaña
            newTab.click();
        } catch (error) {
            console.error('Error al abrir la nueva pestaña:', error);
        }
    }

    if (errorCodeMeta ===2) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error('Error al abrir extension:', error);
        }
    }

    if (errorCodeMeta ===4) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            console.error('Error al abrir extension:', error);
        }
    }

});

// Funcion inicializadora
async function loadInitialData() {
    try {
        if (await connect()) {

            refresh();

        } else {
            return;
        }
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
    }
}

// Funcion Refresh
async function refresh() {
    try {
        await updatePrice();
        await getBalanceAccount();
        updateUI();
    } catch (error) {
        console.error('Error al refrescar:', error);
    }
}

// Actualiza la interfaz de usuario
function updateUI() {
    document.getElementById('precioETH').textContent = `$${parseFloat(formattedPriceETH).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('balanceAccount').textContent = `ETH ${(parseFloat(formattedAccountBalance)).toFixed(6)}`;
    document.getElementById('balanceAccountUsd').textContent = `$${(parseFloat(formattedAccountBalance) * parseFloat(formattedPriceETH)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Escuchar eventos Deposit
window.contractInstanceCryptoSavings.events.Deposit({ filter: { user: window.ethereum.selectedAddress } }, (error, event) => {
    if (!error) {
        refresh();
    } else {
        console.error("Error al escuchar el evento Deposit:", error);
    }
});

// Escuchar eventos Withdrawal
window.contractInstanceCryptoSavings.events.Withdrawal({ filter: { user: window.ethereum.selectedAddress } }, (error, event) => {
    if (!error) {
        refresh();
    } else {
        console.error("Error al escuchar el evento Withdrawal:", error);
    }
});

// Escuchar eventos cambio de cuenta
window.ethereum.on('accountsChanged', function () {
    loadInitialData();
});

// Escuchar eventos cambio de red
window.ethereum.on('chainChanged', function () {
    loadInitialData();
});

// Escuchar eventos conexion
window.ethereum.on('connect', function () {
    loadInitialData();
});

// Escuchar eventos desconexion
window.ethereum.on('disconnect', function () {
    loadInitialData();
});


// Refresh cada 1 minuto
//setInterval(refresh, 60000); // 1 minuto en milisegundos