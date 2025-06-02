let selecionada = null;
let turnoAtual = "White";

function converterColuna(letra) {
    return letra.charCodeAt(0) - 64; // 'A' = 65 → 1
}

function obterTipo(src) {
    const tipos = ["Peao", "Torre", "Cavalo", "Bispo", "Rei", "Rainha"];
    return tipos.find(tipo => src.includes(tipo)) || "";
}

function obterCor(src) {
    const cores = ["White", "Black"];
    return cores.find(cor => src.includes(cor)) || "";
}

function selecionarPeca(botao) {
    const imagem = botao.querySelector('img');

    if (selecionada) {

        if (botao === selecionada) {
            selecionada.classList.remove("Selecionada");
            selecionada = null;
            document.querySelectorAll("button").forEach(botao => {
                botao.classList.remove("PossivelCaminho");
                botao.classList.remove("PossivelCaptura");
            });
            return;
        }

        const posSelecionada = selecionada.dataset.pos.split(", ");
        const posDestino = botao.dataset.pos.split(", ");

        const colunaSelecionada = converterColuna(posSelecionada[0]);
        const linhaSelecionada = Number(posSelecionada[1]);
        const colunaDestino = converterColuna(posDestino[0]);
        const linhaDestino = Number(posDestino[1]);

        const imgSelecionada = selecionada.querySelector('img');
        if (!imgSelecionada) {
            selecionada.classList.remove("Selecionada");
            selecionada = null;
            document.querySelectorAll("button").forEach(botao => {
                botao.classList.remove("PossivelCaminho");
                botao.classList.remove("PossivelCaptura");
            });
            return;
        }

        const src = imgSelecionada.src;
        const tipo = obterTipo(src);
        const cor = obterCor(src);

        if (cor !== turnoAtual) {
            console.log("Não é seu turno");
            return;
        }

        if (tipo !== "Peao" && tipo !== "Torre" && tipo !== "Cavalo" && tipo !== "Bispo" && tipo !== "Rainha" && tipo !== "Rei") {
            selecionada.classList.remove("Selecionada");
            selecionada = null;
            document.querySelectorAll("button").forEach(botao => {
                botao.classList.remove("PossivelCaminho");
                botao.classList.remove("PossivelCaptura");
            });
            return;
        }

        const destinoTemPeca = botao.querySelector('img') !== null;
        let movimentoValido = false;

        // Movimento para o Peão
        if (tipo === "Peao") {
            const deltaX = colunaDestino - colunaSelecionada;
            const deltaY = linhaDestino - linhaSelecionada;

            const corPeao = cor.toLowerCase();

            const direcao = corPeao.includes("white") ? 1 : -1;
            const linhaInicial = corPeao.includes("white") ? 2 : 7;

            if (!destinoTemPeca) {
                if (deltaX === 0 && deltaY === direcao) {
                    movimentoValido = true;
                } else if (deltaX === 0 && deltaY === 2 * direcao && linhaSelecionada === linhaInicial) {
                    const letra = String.fromCharCode(64 + colunaSelecionada);
                    const meio = document.querySelector(`[data-pos="${letra}, ${linhaSelecionada + direcao}"]`);
                    if (meio && meio.querySelector('img') === null) {
                        movimentoValido = true;
                    }
                }
            } else {
                const pecaAlvo = botao.querySelector('img');
                if (Math.abs(deltaX) === 1 && deltaY === direcao && pecaAlvo && !pecaAlvo.src.includes(cor)) {
                    movimentoValido = true;
                }
            }
            // Movimento para a Torre
        } else if (tipo === "Torre") {
            // Pega as diferenças de coluna e linha
            const deltaX = colunaDestino - colunaSelecionada;
            const deltaY = linhaDestino - linhaSelecionada;

            // Torre se movimenta somente em linha reta (horizontal ou vertical)
            const movimentoReto = (deltaX === 0 && deltaY !== 0) || (deltaY === 0 && deltaX !== 0);

            if (movimentoReto) {
                let bloqueado = false;

                // Caminho vertical
                if (deltaX === 0) {
                    const passo = deltaY > 0 ? 1 : -1;
                    for (let i = linhaSelecionada + passo; i !== linhaDestino; i += passo) {
                        const letra = String.fromCharCode(64 + colunaSelecionada);
                        const posIntermediaria = document.querySelector(`[data-pos="${letra}, ${i}"]`);
                        if (posIntermediaria && posIntermediaria.querySelector('img') !== null) {
                            bloqueado = true;
                            break;
                        }
                    }
                }
                // Caminho horizontal
                else if (deltaY === 0) {
                    const passo = deltaX > 0 ? 1 : -1;
                    for (let i = colunaSelecionada + passo; i !== colunaDestino; i += passo) {
                        const letra = String.fromCharCode(64 + i);
                        const posIntermediaria = document.querySelector(`[data-pos="${letra}, ${linhaSelecionada}"]`);
                        if (posIntermediaria && posIntermediaria.querySelector('img') !== null) {
                            bloqueado = true;
                            break;
                        }
                    }
                }

                if (!bloqueado) {
                    if (!destinoTemPeca) {
                        movimentoValido = true;
                    } else {
                        const pecaAlvo = botao.querySelector('img');
                        if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                            movimentoValido = true;
                        } else if (pecaAlvo && pecaAlvo.src.includes(cor)) {
                            movimentoValido = false;
                        }
                    }
                }
            }
            // Movimento para o Cavalo
        } else if (tipo === "Cavalo") {
            const deltaX = Math.abs(colunaDestino - colunaSelecionada);
            const deltaY = Math.abs(linhaDestino - linhaSelecionada);

            // Movimento em "L" válido: 2 em uma direção e 1 na outra
            if ((deltaX === 2 && deltaY === 1) || (deltaX === 1 && deltaY === 2)) {
                if (!destinoTemPeca) {
                    movimentoValido = true;
                } else {
                    const pecaAlvo = botao.querySelector('img');
                    if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                        movimentoValido = true;
                    }
                }
            }
            // Movimento para o Bispo
        } else if (tipo === "Bispo") {
            const deltaX = colunaDestino - colunaSelecionada;
            const deltaY = linhaDestino - linhaSelecionada;

            // Verifica se o movimento é diagonal: |deltaX| === |deltaY|
            if (Math.abs(deltaX) === Math.abs(deltaY)) {
                let bloqueado = false;

                // Define o passo para coluna e linha, pode ser +1 ou -1 dependendo da direção
                const passoX = deltaX > 0 ? 1 : -1;
                const passoY = deltaY > 0 ? 1 : -1;

                // Verifica todas as casas entre o atual e o destino
                let x = colunaSelecionada + passoX;
                let y = linhaSelecionada + passoY;
                while (x !== colunaDestino && y !== linhaDestino) {
                    const letra = String.fromCharCode(64 + x);
                    const posIntermediaria = document.querySelector(`[data-pos="${letra}, ${y}"]`);
                    if (posIntermediaria && posIntermediaria.querySelector('img') !== null) {
                        bloqueado = true;
                        break;
                    }
                    x += passoX;
                    y += passoY;
                }

                if (!bloqueado) {
                    if (!destinoTemPeca) {
                        movimentoValido = true;
                    } else {
                        const pecaAlvo = botao.querySelector('img');
                        if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                            movimentoValido = true;
                        }
                    }
                }
            }
            // Movimento para a Rainha
        } else if (tipo === "Rainha") {
            const deltaX = colunaDestino - colunaSelecionada;
            const deltaY = linhaDestino - linhaSelecionada;

            // Movimento reto (horizontal ou vertical)
            const movimentoReto = (deltaX === 0 && deltaY !== 0) || (deltaY === 0 && deltaX !== 0);

            // Movimento diagonal (mesma quantidade de passos na coluna e linha)
            const movimentoDiagonal = Math.abs(deltaX) === Math.abs(deltaY) && deltaX !== 0;

            if (movimentoReto) {
                let bloqueado = false;

                if (deltaX === 0) { // vertical
                    const passo = deltaY > 0 ? 1 : -1;
                    for (let i = linhaSelecionada + passo; i !== linhaDestino; i += passo) {
                        const letra = String.fromCharCode(64 + colunaSelecionada);
                        const posIntermediaria = document.querySelector(`[data-pos="${letra}, ${i}"]`);
                        if (posIntermediaria && posIntermediaria.querySelector('img') !== null) {
                            bloqueado = true;
                            break;
                        }
                    }
                } else { // horizontal
                    const passo = deltaX > 0 ? 1 : -1;
                    for (let i = colunaSelecionada + passo; i !== colunaDestino; i += passo) {
                        const letra = String.fromCharCode(64 + i);
                        const posIntermediaria = document.querySelector(`[data-pos="${letra}, ${linhaSelecionada}"]`);
                        if (posIntermediaria && posIntermediaria.querySelector('img') !== null) {
                            bloqueado = true;
                            break;
                        }
                    }
                }

                if (!bloqueado) {
                    if (!destinoTemPeca) {
                        movimentoValido = true;
                    } else {
                        const pecaAlvo = botao.querySelector('img');
                        if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                            movimentoValido = true;
                        }
                    }
                }
            } else if (movimentoDiagonal) {
                let bloqueado = false;
                const passoX = deltaX > 0 ? 1 : -1;
                const passoY = deltaY > 0 ? 1 : -1;

                let x = colunaSelecionada + passoX;
                let y = linhaSelecionada + passoY;

                while (x !== colunaDestino && y !== linhaDestino) {
                    const letra = String.fromCharCode(64 + x);
                    const posIntermediaria = document.querySelector(`[data-pos="${letra}, ${y}"]`);
                    if (posIntermediaria && posIntermediaria.querySelector('img') !== null) {
                        bloqueado = true;
                        break;
                    }
                    x += passoX;
                    y += passoY;
                }

                if (!bloqueado) {
                    if (!destinoTemPeca) {
                        movimentoValido = true;
                    } else {
                        const pecaAlvo = botao.querySelector('img');
                        if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                            movimentoValido = true;
                        }
                    }
                }
            }
            // Movimento para o Rei
        } else if (tipo === "Rei") {
            const deltaX = Math.abs(colunaDestino - colunaSelecionada);
            const deltaY = Math.abs(linhaDestino - linhaSelecionada);

            // O rei só pode andar 1 casa em qualquer direção
            const movimentoValidoRei = (deltaX <= 1 && deltaY <= 1) && !(deltaX === 0 && deltaY === 0);

            if (movimentoValidoRei) {
                const pecaAlvo = botao.querySelector('img');
                if (!pecaAlvo) {
                    movimentoValido = true; // casa livre
                } else if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                    movimentoValido = true; // captura peça adversária
                } else {
                    movimentoValido = false; // peça da mesma cor, não pode mover
                }
            } else {
                movimentoValido = false;
            }
        }

        // Continuação da movimentação (Checa se pode se mover, etc.)
        if (!movimentoValido) {
            selecionada.classList.remove("Selecionada");
            selecionada = null;
            document.querySelectorAll("button").forEach(botao => {
                botao.classList.remove("PossivelCaminho");
                botao.classList.remove("PossivelCaptura");
            });
            return;
        }

        if (destinoTemPeca) {
            botao.querySelector('img').remove();
        }

        botao.appendChild(imgSelecionada);
        selecionada.classList.remove("Selecionada");
        selecionada = null;
        document.querySelectorAll("button").forEach(botao => {
            botao.classList.remove("PossivelCaminho");
            botao.classList.remove("PossivelCaptura");
        });

        if (turnoAtual === "White") {
            turnoAtual = "Black";
        } else {
            turnoAtual = "White";
        }

    } else {
        if (imagem) {
            selecionada = botao;
            selecionada.classList.add("Selecionada");

            const posSelecionada = selecionada.dataset.pos.split(", ");

            const colunaSelecionada = converterColuna(posSelecionada[0]);
            const linhaSelecionada = Number(posSelecionada[1]);

            const imgSelecionada = selecionada.querySelector('img');
            src = imgSelecionada.src;
            tipo = obterTipo(src);
            cor = obterCor(src);

            if (cor == turnoAtual) {
                if (tipo === "Peao") {
                    const corPeao = cor.toLowerCase();

                    const direcao = corPeao.includes("white") ? 1 : -1;
                    const linhaInicial = corPeao.includes("white") ? 2 : 7;

                    // Mostrar casas possíveis de movimentação
                    const avancos = [1];
                    if (linhaSelecionada === linhaInicial) avancos.push(2);

                    for (const avanco of avancos) {
                        const novaLinha = linhaSelecionada + avanco * direcao;
                        const letra = String.fromCharCode(64 + colunaSelecionada);
                        const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);
                        if (casa && casa.querySelector("img") === null) {
                            casa.classList.add("PossivelCaminho");
                        } else {
                            break; // Se houver peça à frente, não pode continuar
                        }
                    }

                    // Mostrar capturas diagonais
                    for (const dx of [-1, 1]) {
                        const novaColuna = colunaSelecionada + dx;
                        const novaLinha = linhaSelecionada + direcao;
                        if (novaColuna >= 1 && novaColuna <= 8 && novaLinha >= 1 && novaLinha <= 8) {
                            const letra = String.fromCharCode(64 + novaColuna);
                            const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);
                            if (casa) {
                                const pecaAlvo = casa.querySelector("img");
                                if (pecaAlvo && !pecaAlvo.src.includes(cor)) {
                                    casa.classList.add("PossivelCaptura");
                                }
                            }
                        }
                    }
                } else if (tipo === "Torre") {
                    const direcoes = [
                        [1, 0], [-1, 0], // Horizontal: direita, esquerda
                        [0, 1], [0, -1]  // Vertical: cima, baixo
                    ];

                    for (const [dx, dy] of direcoes) {
                        let novaColuna = colunaSelecionada + dx;
                        let novaLinha = linhaSelecionada + dy;

                        while (novaColuna >= 1 && novaColuna <= 8 && novaLinha >= 1 && novaLinha <= 8) {
                            const letra = String.fromCharCode(64 + novaColuna);
                            const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);

                            if (casa) {
                                const pecaAlvo = casa.querySelector("img");

                                if (!pecaAlvo) {
                                    casa.classList.add("PossivelCaminho");
                                } else {
                                    if (!pecaAlvo.src.includes(cor)) {
                                        casa.classList.add("PossivelCaptura"); // Pode capturar
                                    }
                                    break; // Para após encontrar uma peça
                                }
                            }

                            novaColuna += dx;
                            novaLinha += dy;
                        }
                    }
                } else if (tipo === "Cavalo") {
                    const corCavalo = cor.toLowerCase();  // para padronizar a comparação
                    const movimentos = [
                        [1, 2], [2, 1], [2, -1], [1, -2],
                        [-1, -2], [-2, -1], [-2, 1], [-1, 2]
                    ];

                    for (const [dx, dy] of movimentos) {
                        const novaColuna = colunaSelecionada + dx;
                        const novaLinha = linhaSelecionada + dy;

                        // Verifica se está dentro do tabuleiro
                        if (novaColuna >= 1 && novaColuna <= 8 && novaLinha >= 1 && novaLinha <= 8) {
                            const letra = String.fromCharCode(64 + novaColuna);
                            const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);
                            if (casa) {
                                const pecaAlvo = casa.querySelector("img");

                                // Se a casa estiver vazia OU tiver peça adversária
                                if (!pecaAlvo) {
                                    casa.classList.add("PossivelCaminho");  // pode andar
                                } else if (!pecaAlvo.src.toLowerCase().includes(corCavalo)) {
                                    casa.classList.add("PossivelCaptura");  // pode capturar
                                }
                            }
                        }
                    }
                } else if (tipo === "Bispo") {
                    const direcoes = [
                        [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonais
                    ];

                    for (const [dx, dy] of direcoes) {
                        let novaColuna = colunaSelecionada + dx;
                        let novaLinha = linhaSelecionada + dy;

                        while (novaColuna >= 1 && novaColuna <= 8 && novaLinha >= 1 && novaLinha <= 8) {
                            const letra = String.fromCharCode(64 + novaColuna);
                            const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);

                            if (casa) {
                                const pecaAlvo = casa.querySelector("img");

                                if (!pecaAlvo) {
                                    casa.classList.add("PossivelCaminho");
                                } else {
                                    if (!pecaAlvo.src.includes(cor)) {
                                        casa.classList.add("PossivelCaptura"); // Pode capturar
                                    }
                                    break; // Para após encontrar uma peça
                                }
                            }

                            novaColuna += dx;
                            novaLinha += dy;
                        }
                    }
                } else if (tipo === "Rei") {
                    const corRei = cor.toLowerCase();

                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            if (dx === 0 && dy === 0) continue;

                            const novaColuna = colunaSelecionada + dx;
                            const novaLinha = linhaSelecionada + dy;

                            if (novaColuna >= 1 && novaColuna <= 8 && novaLinha >= 1 && novaLinha <= 8) {
                                const letra = String.fromCharCode(64 + novaColuna);
                                const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);
                                if (casa) {
                                    const pecaAlvo = casa.querySelector("img");
                                    if (!pecaAlvo) {
                                        casa.classList.add("PossivelCaminho"); // Pode andar
                                    } else if (!pecaAlvo.src.toLowerCase().includes(corRei)) {
                                        casa.classList.add("PossivelCaptura"); // Pode capturar
                                    }
                                }
                            }
                        }
                    }
                } else if (tipo === "Rainha") {
                    const direcoes = [
                        [1, 0], [-1, 0], // Horizontais
                        [0, 1], [0, -1], // Verticais
                        [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonais
                    ];

                    for (const [dx, dy] of direcoes) {
                        let novaColuna = colunaSelecionada + dx;
                        let novaLinha = linhaSelecionada + dy;

                        while (novaColuna >= 1 && novaColuna <= 8 && novaLinha >= 1 && novaLinha <= 8) {
                            const letra = String.fromCharCode(64 + novaColuna);
                            const casa = document.querySelector(`[data-pos="${letra}, ${novaLinha}"]`);

                            if (casa) {
                                const pecaAlvo = casa.querySelector("img");

                                if (!pecaAlvo) {
                                    casa.classList.add("PossivelCaminho");
                                } else {
                                    if (!pecaAlvo.src.includes(cor)) {
                                        casa.classList.add("PossivelCaptura"); // Captura
                                    }
                                    break; // Parar após encontrar peça
                                }
                            }

                            novaColuna += dx;
                            novaLinha += dy;
                        }
                    }
                }
            }
        }
    }
}