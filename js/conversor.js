
function validarEntradas(estados, alfabeto, estadoInicial, estadosFinais) {
    const regexAlfanumerico = /^[a-zA-Z0-9]+$/;
    let erros = [];

    if (estados.length === 0) erros.push("A lista de estados não pode estar vazia.");
    if (alfabeto.length === 0) erros.push("O alfabeto não pode estar vazio.");
    if (!estadoInicial) erros.push("Você deve definir um estado inicial.");

    if (alfabeto.length > 10) {
        erros.push(`O alfabeto possui ${alfabeto.length} símbolos. O limite máximo é 10.`);
    }

    let estadosVistos = new Set();
    for (const estado of estados) {
        if (!regexAlfanumerico.test(estado)) {
            erros.push(`O estado '${estado}' é inválido. Use apenas letras e números.`);
        }
        if (estadosVistos.has(estado)) {
            erros.push(`O estado '${estado}' está duplicado na lista de estados.`);
        }
        estadosVistos.add(estado);
    }

    let alfabetoVisto = new Set();
    for (const simbolo of alfabeto) {
        if (!regexAlfanumerico.test(simbolo)) {
            erros.push(`O símbolo '${simbolo}' é inválido. Use apenas letras e números.`);
        }
        if (alfabetoVisto.has(simbolo)) {
            erros.push(`O símbolo '${simbolo}' está duplicado no alfabeto.`);
        }
        alfabetoVisto.add(simbolo);
    }

    if (estadoInicial && !estadosVistos.has(estadoInicial)) {
        erros.push(`O estado inicial '${estadoInicial}' não existe na lista de estados.`);
    }

    for (const final of estadosFinais) {
        if (final && !estadosVistos.has(final)) {
            erros.push(`O estado final '${final}' não existe na lista de estados.`);
        }
    }

    return {
        valido: erros.length === 0,
        mensagens: erros
    };
}

function lerConjunto(texto) {
    if (!texto || texto === '∅' || texto === '{}') return [];
    return texto.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(s => s);
}

function gerarChave(arrayEstados) {
    return Array.from(arrayEstados).sort((a, b) => a - b).join(',');
}

function calcularFechoEpsilon(listaEstados, afn, temEpsilon) {
    if (!temEpsilon) return listaEstados; 
    
    let fecho = new Set(listaEstados);
    let fila = [...listaEstados];

    while (fila.length > 0) {
        let atual = fila.shift();
        if (afn[atual] && afn[atual]['&']) {
            for (const destino of afn[atual]['&']) {
                if (!fecho.has(destino)) {
                    fecho.add(destino);
                    fila.push(destino);
                }
            }
        }
    }
    return Array.from(fecho);
}

document.querySelector('.btn-submit').addEventListener('click', converterAFNparaAFD);

function converterAFNparaAFD() {

    const estados = document.getElementById('input-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alfabeto = document.getElementById('input-alphabet').value.split(',').map(a => a.trim()).filter(a => a);
    const estadoInicial = document.getElementById('input-initial').value.trim();
    const estadosFinais = document.getElementById('input-final').value.split(',').map(s => s.trim());
    const temEpsilon = document.getElementById('toggle-epsilon').checked;

    const validacao = validarEntradas(estados, alfabeto, estadoInicial, estadosFinais);
    
    if (!validacao.valido) {
        const container = document.getElementById('resultado-afd');
        let errorHTML = '<div style="background-color: #ffe6e6; border-left: 4px solid #d9534f; padding: 15px; margin-top: 20px; border-radius: 4px;">';
        errorHTML += '<h4 style="color: #d9534f; margin-top: 0;">Foram encontrados erros na sua entrada:</h4><ul style="color: #a94442;">';
        for (const msg of validacao.mensagens) {
            errorHTML += `<li>${msg}</li>`;
        }
        errorHTML += '</ul></div>';
        
        container.innerHTML = errorHTML;
        
        return;
    }

    const afn = {};
    const linhas = document.querySelectorAll('#table-body tr');

    linhas.forEach((linha, rowIndex) => {
        const estadoAtual = estados[rowIndex];
        afn[estadoAtual] = {};
        const inputs = linha.querySelectorAll('input');

        // Lendo as transicoes
        alfabeto.forEach((simbolo, symIndex) => {
            afn[estadoAtual][simbolo] = lerConjunto(inputs[symIndex].value);
        });

        if (temEpsilon) {
            afn[estadoAtual]['&'] = lerConjunto(inputs[alfabeto.length].value);
        }
    });

    let afd = {};
    let afdFinais = new Set();
    let fila = [];
    let visitados = new Set();

    let estado_inicial_afd = calcularFechoEpsilon([estadoInicial], afn, temEpsilon);
    let chave_inicial_afd = gerarChave(estado_inicial_afd);

    fila.push(estado_inicial_afd);
    visitados.add(chave_inicial_afd);

    while (fila.length > 0) {
        let conjuntoAtual = fila.shift();
        let chaveAtual = gerarChave(conjuntoAtual);
        afd[chaveAtual] = {};

        let isFinal = false;
        for (const estado of conjuntoAtual) {
            if (estadosFinais.includes(estado)) {
                isFinal = true;
                break;
            }
        }
        if (isFinal) {
            afdFinais.add(chaveAtual);
        }

        for (const simbolo of alfabeto) {
            let destinosAlcancaveis = new Set();
            
            for (const estado of conjuntoAtual) {
                if (afn[estado] && afn[estado][simbolo]) {
                    for (const dest of afn[estado][simbolo]) {
                        destinosAlcancaveis.add(dest);
                    }
                }
            }

            let novoEstadoArray = calcularFechoEpsilon(Array.from(destinosAlcancaveis), afn, temEpsilon);
            let novaChave = novoEstadoArray.length > 0 ? gerarChave(novoEstadoArray) : '∅';

            afd[chaveAtual][simbolo] = novaChave;

            if (novaChave !== '∅' && !visitados.has(novaChave)) {
                visitados.add(novaChave);
                fila.push(novoEstadoArray);
            }
        }
    }

    desenharTabelaAFD(afd, alfabeto, chave_inicial_afd, afdFinais);
}

function desenharTabelaAFD(afd, alfabeto, inicialKey, finaisSet) {
    const container = document.getElementById('resultado-afd');
    
    let chavesAFD = [];
    for (const chave in afd) {
        if (afd.hasOwnProperty(chave)) {
            chavesAFD.push(chave);
        }
    }

    if (chavesAFD.length === 0) {
        container.innerHTML = "<p>Nenhum estado gerado.</p>";
        return;
    }

    let html = '<div class="table-header-text" style="margin-top: 20px;">Tabela do AFD Gerado</div>';
    html += '<table><thead><tr><th>Estado (AFD)</th>';
    
    for (const simbolo of alfabeto) {
        html += `<th>δ(${simbolo})</th>`;
    }
    html += '</tr></thead><tbody>';

    for (const estado of chavesAFD) {
        let prefixo = '';
        if (estado === inicialKey) prefixo += '→ ';
        if (finaisSet.has(estado)) prefixo += '* ';
        
        let nomeVisual = estado.includes(',') ? `{${estado}}` : (estado === '' ? '∅' : estado);
        
        html += `<tr><td><strong>${prefixo}${nomeVisual}</strong></td>`;

        for (const simbolo of alfabeto) {
            let destino = afd[estado][simbolo];
            let destinoVisual = destino === '∅' ? '∅' : (destino.includes(',') ? `{${destino}}` : destino);
            html += `<td>${destinoVisual}</td>`;
        }

        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}