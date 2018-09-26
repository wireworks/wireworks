// Planner
// +=========================+
// Autor: Henrique Colini
// Versão: 1.1 (2018-09-23)

// --------------------------------------------------------------------------------------------------------------------------
// createPlan() - Gera a tabela do Plano de Endereçamento
// --------------------------------------------------------------------------------------------------------------------------

function createPlan() {

	let values = parseIpValues(id('ipmask').value);
	let oldPlan = id('plan');

	if (oldPlan !== null) {
		oldPlan.remove();
	}

	let table = document.createElement('table');

	if (values !== undefined) {

		let validation = validateIpValues(values, true);

		if (validation[0] !== V_SUCCESS) {

			let errstr = '';

			for (let i = 0; i < validation.length; i++) {

				switch (validation[i]) {
					case V_BIGBYTES:
						errstr += ' Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).';
						break;
					case V_BIGMASK:
						errstr += ' O valor da máscara é alto demais (deve estar entre 0-32).';
						break;
					case V_NOTNETADDRESS:
						let likelyValues = getNetDecimals(values);
						likelyValues.mask = values.mask;
						let likely = ipValuesToStr(likelyValues);
						errstr += ` Esse endereço de rede é icompatível com a máscara. Você quis dizer ${likely}?`;
						break;
					default:
						errstr += ' Erro desconhecido.';
				}

			}

			table.innerHTML = `
				<td>
					<h2 class="error">Entrada inválida.${errstr}</h2>
				</td>
			`;

		}
		else {
			let mask = decimalsToStr(bytesToDecimals(maskNumberToBytes(values.mask)));
			let hosts = hostNumber(values.mask).toLocaleString();
			let network = '';
			let firstValid = '';
			let broadcast = '';
			let lastValid = '';

			if (values.mask < 31) {
				network = ipValuesToStr(values);
				let firstValidDecimals = values.slice();
				firstValidDecimals[3]++;
				firstValid = decimalsToStr(firstValidDecimals);

				let broadcastDecimals = getBroadcastDecimals(values);
				let lastValidDecimals = broadcastDecimals.slice();
				lastValidDecimals[3]--;

				broadcast = decimalsToStr(broadcastDecimals);
				lastValid = decimalsToStr(lastValidDecimals);
			}
			else {
				if (values.mask == 31) {
					network = 'N/A';
					broadcast = 'N/A';
					let lastValidDecimals = values.slice();
					lastValidDecimals[3]++;
					firstValid = decimalsToStr(values);
					lastValid = decimalsToStr(lastValidDecimals);
				}
				else if (values.mask == 32) {
					network = 'N/A';
					broadcast = 'N/A';
					firstValid = decimalsToStr(values);
					lastValid = firstValid;
				}
			}

			table.innerHTML = `
				<tr>
					<th>Rede</th>
					<th>Máscara</th>
					<th>Primeiro Válido</th>
					<th>Último Válido</th>
					<th>Broadcast</th>
					<th>Hosts</th>
				</tr>
				<tr>
					<td>${network}</td>
					<td>${mask}</td>
					<td>${firstValid}</td>
					<td>${lastValid}</td>
					<td>${broadcast}</td>
					<td>${hosts}</td>
				</tr>
			`;
		}
	}
	else {
		table.innerHTML = `
			<td>
				<h2 class="error">Entrada inválida. A entrada deve seguir o seguinte padrão: 0.0.0.0/0</h2>
			</td>
		`;
	}

	table.id = "plan";
	id('container').appendChild(table);
}
