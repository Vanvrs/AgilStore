//Gerarcódigo de produto único
function gerarCodigoProduto() {
    const timestamp = Date.now();
    return `PROD_${timestamp}`;
}

//Validar de formulário de cadastro 
function validarProduto() {
    var nomeProduto = document.getElementById('txtNomeProduto').value;
    var categoria = document.getElementById('txtCategoria').value;
    var quantidadeDesejada = document.getElementById('quantidadeDesejada').value;
    var precoUnitario = document.getElementById('txtValorProduto').value;

    //Validar campos obrig
    if (!nomeProduto || !categoria || !quantidadeDesejada || !precoUnitario) {
        alert("Todos os campos obrigatórios devem ser preenchidos!");
        return;
    }

    //Chame a função para cadastrar o produto com os dados preenchidos
    cadastrarProduto(nomeProduto, categoria, parseInt(quantidadeDesejada), parseFloat(precoUnitario));
}

//cadastrar o produto
function cadastrarProduto(nomeProduto, categoria, quantidadeDesejada, precoUnitario) {
    if (typeof(Storage) !== "undefined") {
        const codigoProduto = gerarCodigoProduto(); //Gerar código
        let produtos = JSON.parse(localStorage.getItem("produtos")) || []; //lista de produtos || criar nova
        const produtoExistente = produtos.find(prod => prod.nome === nomeProduto);

        if (produtoExistente) {
            //atualizar o produto 
            produtoExistente.quantidade += quantidadeDesejada;
            produtoExistente.valor = precoUnitario;
            produtoExistente.categoria = categoria;
        } else {
            //Adic novo produto
            const novoProduto = {
                nome: nomeProduto,
                codigo: codigoProduto,
                categoria: categoria,
                quantidade: quantidadeDesejada,
                valor: precoUnitario,
            };
            produtos.push(novoProduto);
        }

        localStorage.setItem("produtos", JSON.stringify(produtos)); //Atualização do localStorage
        alert("Produto cadastrado com sucesso!");
        atualizarTotalEstoque("totalEstoque");
        window.location.href = "verEstoque.html"; //Redir pág de estoque
    } else {
        alert("Seu navegador não suporta armazenamento local!");
    }
}

//Carregar o total de produtos no estoque
function carregarTotalEstoque(idCampo) {
    if (typeof(Storage) !== "undefined") {
        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        let totalEstoque = produtos.reduce((total, produto) => total + produto.quantidade, 0);
        document.getElementById(idCampo).textContent = totalEstoque;
    } else {
        alert("Seu navegador não suporta armazenamento local!");
    }
}

//listar os prod no estoque
function listarEstoque() {
    if (typeof(Storage) !== "undefined") {
        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        let tabelaEstoque = document.getElementById("tabelaEstoque").getElementsByTagName("tbody")[0];

        //Limpa a tabela antes de preencher com os resultados
        tabelaEstoque.innerHTML = "";

        if (produtos.length === 0) {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.colSpan = 6;
            td.textContent = "Não há produtos no estoque";
            tr.appendChild(td);
            tabelaEstoque.appendChild(tr);
        } else {
            produtos.forEach(produto => {
                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>${produto.codigo}</td>
                    <td>${produto.categoria}</td>
                    <td>${produto.quantidade}</td>
                    <td>R$ ${produto.valor.toFixed(2)}</td>
                    <td>
                        <button onclick="excluirProduto('${produto.codigo}')">Excluir</button>
                        <button onclick="editarProduto('${produto.codigo}')">Editar</button>
                    </td>
                `;
                tabelaEstoque.appendChild(tr);
            });
        }
    } else {
        alert("Seu navegador não suporta armazenamento local!");
    }
}

//buscar produtos
function buscarProduto() {
    let termoBusca = document.getElementById('buscarProduto').value.toLowerCase();
    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    //Vpágina q está sendo acessada
    if (window.location.pathname.includes("index.html")) {
        //Página de cadastro, mostrar os resultados aqui
        let divProdutos = document.getElementById('produtosEncontrados');
        divProdutos.innerHTML = '';  //Limpar 

        let resultados = produtos.filter(prod => prod.nome.toLowerCase().includes(termoBusca));

        if (resultados.length === 0) {
            divProdutos.innerHTML = '<p>Nenhum produto encontrado.</p>';
        } else {
            let lista = '<ul>';
            resultados.forEach(produto => {
                lista += `<li>${produto.nome} - R$ ${produto.valor.toFixed(2)} - Quantidade: ${produto.quantidade}</li>`;
            });
            lista += '</ul>';
            divProdutos.innerHTML = lista;
        }
    } else if (window.location.pathname.includes("verEstoque.html")) {
        //Página de estoque, listar os resultados na tabela
        let tabelaEstoque = document.getElementById("tabelaEstoque").getElementsByTagName("tbody")[0];
        tabelaEstoque.innerHTML = ''; //Limpar tabela antes de preencher

        let resultados = produtos.filter(prod => prod.nome.toLowerCase().includes(termoBusca));

        if (resultados.length === 0) {
            tabelaEstoque.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
        } else {
            resultados.forEach(produto => {
                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>${produto.codigo}</td>
                    <td>${produto.categoria}</td>
                    <td>${produto.quantidade}</td>
                    <td>R$ ${produto.valor.toFixed(2)}</td>
                    <td>
                        <button onclick="excluirProduto('${produto.codigo}')">Excluir</button>
                        <button onclick="editarProduto('${produto.codigo}')">Editar</button>
                    </td>
                `;
                tabelaEstoque.appendChild(tr);
            });
        }
    }
}

//excluir um produto
function excluirProduto(codigo) {
    if (typeof(Storage) !== "undefined") {
        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

        //Filtra os produtos removendo o produto com o código fornecido
        produtos = produtos.filter(prod => prod.codigo !== codigo);

        //Atualiza o localStorage com a lista de produtos atualizada
        localStorage.setItem("produtos", JSON.stringify(produtos));

        //lista de produtos atualizados
        listarEstoque();
        carregarTotalEstoque('totalEstoque');
        alert("Produto excluído com sucesso!");
    } else {
        alert("Seu navegador não suporta armazenamento local!");
    }
}

//limpar todo estoque
function limparEstoque() {
    if (typeof(Storage) !== "undefined") {
        if (confirm("Tem certeza que deseja limpar todo o estoque?")) {
            localStorage.removeItem("produtos"); //Limpar todos os produtos
            listarEstoque(); //Atualizar a visualização
            carregarTotalEstoque("totalEstoque");
            alert("Estoque limpo com sucesso!");
        }
    } else {
        alert("Seu navegador não suporta armazenamento local!");
    }
}

//Editar um produto
function editarProduto(codigo) {
    if (typeof(Storage) !== "undefined") {
        let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
        let produto = produtos.find(prod => prod.codigo === codigo);

        if (produto) {
            //Prompt para realizar de edição de cada item.
            let novoNome = prompt("Novo nome do produto:", produto.nome);
            let novaCategoria = prompt("Nova categoria:", produto.categoria);
            let novaQuantidade = prompt("Nova quantidade:", produto.quantidade);
            let novoValor = prompt("Novo valor do produto (R$):", produto.valor);

            if (novoNome && novaCategoria && novaQuantidade && novoValor) {
                produto.nome = novoNome;
                produto.categoria = novaCategoria;
                produto.quantidade = parseInt(novaQuantidade);
                produto.valor = parseFloat(novoValor);

                //Atualização do localStorage
                localStorage.setItem("produtos", JSON.stringify(produtos));

                //Atualização lista de produtos
                listarEstoque();
                carregarTotalEstoque('totalEstoque');
                alert("Produto editado com sucesso!");
            }
        }
    } else {
        alert("Seu navegador não suporta armazenamento local!");
    }
}

