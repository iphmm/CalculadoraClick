const caixas = [
    { nome: 'PP', dimensoes: [27, 18, 11], volume: 27 * 18 * 11 },
    { nome: 'M', dimensoes: [61, 41, 31], volume: 61 * 41 * 31 },
    { nome: 'G', dimensoes: [66, 53, 38], volume: 66 * 53 * 38 }
];

const fatorCubagem = 300; // kg/m³ (transporte rodoviário)
let itens = [];

function cabeNaCaixa(itemDimensoes, caixaDimensoes) {
    const item = [...itemDimensoes].sort((a, b) => b - a);
    const caixa = [...caixaDimensoes].sort((a, b) => b - a);
    return item[0] <= caixa[0] && item[1] <= caixa[1] && item[2] <= caixa[2];
}

function escolherMelhorCaixa(primeiraDimensao, largura, altura, quantidade, volumeItem) {
    const dimensoesItem = [primeiraDimensao, largura, altura];
    let melhorCaixa = null;
    let menorNumCaixas = Infinity;
    let caixasNecessarias = 0;

    for (const caixa of caixas) {
        if (cabeNaCaixa(dimensoesItem, caixa.dimensoes)) {
            const itensPorCaixa = Math.floor(caixa.volume / volumeItem);
            const numCaixas = Math.ceil(quantidade / itensPorCaixa);
            if (numCaixas < menorNumCaixas) {
                menorNumCaixas = numCaixas;
                melhorCaixa = caixa;
                caixasNecessarias = numCaixas;
            }
        }
    }

    return {
        nome: melhorCaixa ? melhorCaixa.nome : 'Nenhuma',
        caixasNecessarias: melhorCaixa ? caixasNecessarias : 0
    };
}

function adicionarItem() {
    const nome = document.getElementById('nome').value.trim();
    const circunferenciaOuComprimento = parseFloat(document.getElementById('circunferenciaOuComprimento').value);
    const isCilindrico = document.getElementById('isCilindrico').checked;
    const largura = parseFloat(document.getElementById('largura').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const pesoReal = parseFloat(document.getElementById('peso').value);

    if (!nome || isNaN(circunferenciaOuComprimento) || isNaN(largura) || isNaN(altura) || isNaN(quantidade) || isNaN(pesoReal)) {
        alert('Por favor, preencha todos os campos com valores válidos.');
        return;
    }

    let volumeItem, cubagemItem, primeiraDimensao;

    if (isCilindrico) {
        // Item cilíndrico: calcula diâmetro a partir da circunferência
        const diametro = circunferenciaOuComprimento / Math.PI;
        const raio = diametro / 2;
        volumeItem = Math.PI * raio * raio * altura; // Volume em cm³
        cubagemItem = (volumeItem * quantidade) / 1000000; // Cubagem em m³
        primeiraDimensao = diametro;
    } else {
        // Item retangular: usa comprimento
        volumeItem = circunferenciaOuComprimento * largura * altura; // Volume em cm³
        cubagemItem = (volumeItem * quantidade) / 1000000; // Cubagem em m³
        primeiraDimensao = circunferenciaOuComprimento;
    }

    // Escolhe a melhor caixa
    const caixaInfo = escolherMelhorCaixa(primeiraDimensao, largura, altura, quantidade, volumeItem);

    // Adiciona o item à lista
    itens.push({
        nome,
        circunferenciaOuComprimento,
        isCilindrico,
        largura,
        altura,
        quantidade,
        pesoReal: pesoReal * quantidade,
        cubagem: cubagemItem,
        caixa: caixaInfo.nome,
        caixasNecessarias: caixaInfo.caixasNecessarias
    });

    atualizarTabela();
    atualizarResultados();

    // Limpa os inputs
    document.getElementById('nome').value = '';
    document.getElementById('circunferenciaOuComprimento').value = '';
    document.getElementById('isCilindrico').checked = false;
    document.getElementById('largura').value = '';
    document.getElementById('altura').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('peso').value = '';
}

function removerItem(index) {
    itens.splice(index, 1);
    atualizarTabela();
    atualizarResultados();
}

function atualizarTabela() {
    const corpoTabela = document.getElementById('corpoTabela');
    corpoTabela.innerHTML = '';

    itens.forEach((item, index) => {
        const circunferenciaDisplay = item.isCilindrico 
            ? `${item.circunferenciaOuComprimento.toFixed(2)} (C)` 
            : `${item.circunferenciaOuComprimento.toFixed(2)} (L)`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nome}</td>
            <td>${circunferenciaDisplay}</td>
            <td>${item.largura.toFixed(2)}</td>
            <td>${item.altura.toFixed(2)}</td>
            <td>${item.quantidade}</td>
            <td>${item.pesoReal.toFixed(2)}</td>
            <td>${item.caixa}</td>
            <td>${item.caixasNecessarias}</td>
            <td>${item.cubagem.toFixed(4)}</td>
            <td><button class="remove-btn" onclick="removerItem(${index})">Remover</button></td>
        `;
        corpoTabela.appendChild(row);
    });
}

function atualizarResultados() {
    const cubagemTotal = itens.reduce((total, item) => total + item.cubagem, 0);
    const pesoCubadoTotal = cubagemTotal * fatorCubagem;
    const pesoRealTotal = itens.reduce((total, item) => total + item.pesoReal, 0);
    const contagemCaixas = { PP: 0, M: 0, G: 0 };
    itens.forEach(item => {
        if (item.caixa !== 'Nenhuma') {
            contagemCaixas[item.caixa] += item.caixasNecessarias;
        }
    });

    document.getElementById('resultado').innerHTML = 
        `Cubagem Total: ${cubagemTotal.toFixed(4)} m³ | ` +
        `Peso Cubado: ${pesoCubadoTotal.toFixed(2)} kg | ` +
        `Peso Real: ${pesoRealTotal.toFixed(2)} kg<br>` +
        `Caixas Sugeridas: PP: ${contagemCaixas.PP}, M: ${contagemCaixas.M}, G: ${contagemCaixas.G}`;
}