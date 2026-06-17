const inputStates = document.getElementById('input-states');
const inputAlphabet = document.getElementById('input-alphabet');
const inputInitial = document.getElementById('input-initial');
const inputFinal = document.getElementById('input-final');
const toggleEpsilon = document.getElementById('toggle-epsilon');
const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');

function carregarTabela() {

    const states = inputStates.value.split(',').map(s => s.trim()).filter(s => s !== "");
    const alphabet = inputAlphabet.value.split(',').map(a => a.trim()).filter(a => a !== "");
    const hasEpsilon = toggleEpsilon.checked;
    const initialState = inputInitial.value.trim();
    const finalStates = inputFinal.value.split(',').map(s => s.trim());

    // Header
    let headHTML = '<tr><th>Estado</th>';
    alphabet.forEach(symbol => {
        headHTML += `<th>δ(${symbol})</th>`;
    });
    if (hasEpsilon) {
        headHTML += `<th>δ(ε)</th>`;
    }
    headHTML += '</tr>';
    tableHead.innerHTML = headHTML;
              
    // Linhas
    let bodyHTML = '';
    states.forEach(state => {
        let prefix = '';
        if (state === initialState) prefix += '→ ';
        if (finalStates.includes(state)) prefix += '* ';

        bodyHTML += `<tr>`;
        bodyHTML += `<td><strong>${prefix}${state}</strong></td>`;
                
        alphabet.forEach(() => {
            bodyHTML += `<td><input type="text" placeholder="∅"></td>`;
        });

        if (hasEpsilon) {
            bodyHTML += `<td><input type="text" placeholder="∅"></td>`;
        }
                
        bodyHTML += `</tr>`;
    });
    tableBody.innerHTML = bodyHTML;
}

inputStates.addEventListener('input', carregarTabela);
inputAlphabet.addEventListener('input', carregarTabela);
inputInitial.addEventListener('input', carregarTabela);
inputFinal.addEventListener('input', carregarTabela);
toggleEpsilon.addEventListener('change', carregarTabela);

carregarTabela();