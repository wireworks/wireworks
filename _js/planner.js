// Autor: Henrique Colini
// Versão: 1.1 (2018-09-23)

function createPlan() {

	let values = strToIPValues(id('ipmask').value);
	let oldPlan = id('plan');

	if (oldPlan !== null) {
		oldPlan.remove();
	}

	let table = document.createElement('table');

	if (values !== undefined) {

		let validation = validateIpValues(values);

		if (validation[0] !== V_SUCCESS) {

			let errstr = 'Entrada inválida.';

			for (let i = 0; i < validation.length; i++) {

				switch (validation[i]) {
					case V_BIGBYTES:
						errstr += ' Um ou mais octetos possui um valor alto demais (deve estar entre 0-255).';
						break;
					case V_BIGMASK:
						errstr += ' O valor da máscara é alto demais (deve estar entre 0-32).';
						break;
					default:
						errstr += ' Erro desconhecido.';

				}

			}

			table.innerHTML = `
				<td>
					<h2 class="error">${errstr}</h2>
				</td>
			`;

		}
		else {
			let netDecimals = getNetDecimals(values);

			if (values[0] == netDecimals[0] && values[1] == netDecimals[1] &&
					values[2] == netDecimals[2] && values[3] == netDecimals[3]) {

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
			else {

				let likelyValues = netDecimals.slice();
				likelyValues.mask = values.mask;
				let likely = ipValuesToStr(likelyValues);

				table.innerHTML = `
					<td>
						<h2 class="error">Esse endereço de rede é icompatível com a máscara. Você quis dizer ${likely}?</h2>
					</td>
				`;
			}
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
