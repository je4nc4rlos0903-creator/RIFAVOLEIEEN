// ======================================================
// RIFA ONLINE
// Desenvolvido para 6000 números
// ======================================================

const TOTAL_NUMEROS = 6000;
const NUMEROS_POR_PAGINA = 100;
const VALOR_NUMERO = 10.00; // Altere o valor da cota aqui

let paginaAtual = 1;
let numerosSelecionados = [];

// Elementos

const grade = document.getElementById("gradeNumeros");
const pagina = document.getElementById("paginaAtual");
const lista = document.getElementById("listaSelecionados");
const total = document.getElementById("valorTotal");

const btnAnterior = document.getElementById("anterior");
const btnProximo = document.getElementById("proximo");

// ======================================================
// FORMATA NÚMERO
// ======================================================

function formatarNumero(numero){

    return numero
    .toString()
    .padStart(4,"0");

}

// ======================================================
// DESENHAR GRADE
// ======================================================

function carregarPagina(){

    grade.innerHTML = "";

    const inicio =
    ((paginaAtual-1)*NUMEROS_POR_PAGINA)+1;

    const fim =
    Math.min(
        inicio+
        NUMEROS_POR_PAGINA-1,
        TOTAL_NUMEROS
    );

    pagina.innerHTML =
    `Página ${paginaAtual}`;

    for(let i=inicio;i<=fim;i++){

        const botao =
        document.createElement("button");

        botao.className="numero";

        botao.dataset.numero=i;

        botao.innerHTML=
        formatarNumero(i);

        if(
            numerosSelecionados.includes(i)
        ){

            botao.classList.add(
                "selecionado"
            );

        }

        botao.onclick=()=>{

            selecionarNumero(
                i,
                botao
            );

        };

        grade.appendChild(botao);

    }

}

// ======================================================
// SELECIONAR
// ======================================================

function selecionarNumero(
    numero,
    botao
){

    const indice =
    numerosSelecionados.indexOf(numero);

    if(indice>=0){

        numerosSelecionados.splice(
            indice,
            1
        );

        botao.classList.remove(
            "selecionado"
        );

    }else{

        numerosSelecionados.push(
            numero
        );

        botao.classList.add(
            "selecionado"
        );

    }

    atualizarResumo();

}

// ======================================================
// RESUMO
// ======================================================

function atualizarResumo(){

    if(
        numerosSelecionados.length==0
    ){

        lista.innerHTML=
        "Nenhum número selecionado";

    }else{

        numerosSelecionados.sort(
            (a,b)=>a-b
        );

        lista.innerHTML=
        numerosSelecionados
        .map(
            formatarNumero
        )
        .join(", ");

    }

    const valor=
    numerosSelecionados.length*
    VALOR_NUMERO;

    total.innerHTML=
    "R$ "+
    valor.toFixed(2)
    .replace(".",",");

}
// ======================================================
// PAGINAÇÃO
// ======================================================

btnProximo.addEventListener("click",()=>{

    const totalPaginas =
    Math.ceil(
        TOTAL_NUMEROS /
        NUMEROS_POR_PAGINA
    );

    if(paginaAtual < totalPaginas){

        paginaAtual++;

        carregarPagina();

        carregarStatusPagina();

    }

});

btnAnterior.addEventListener("click",()=>{

    if(paginaAtual>1){

        paginaAtual--;

        carregarPagina();

        carregarStatusPagina();

    }

});

// ======================================================
// BUSCA
// ======================================================

document
.getElementById("btnBuscar")
.addEventListener("click",()=>{

    const campo =
    document.getElementById("buscarNumero");

    const numero =
    parseInt(campo.value);

    if(isNaN(numero)){

        alert("Digite um número.");

        return;

    }

    if(numero<1 || numero>6000){

        alert("Número inválido.");

        return;

    }

    paginaAtual =
    Math.ceil(
        numero/
        NUMEROS_POR_PAGINA
    );

    carregarPagina();

    carregarStatusPagina();

    setTimeout(()=>{

        const botao =
        document.querySelector(
            `[data-numero="${numero}"]`
        );

        if(botao){

            botao.scrollIntoView({

                behavior:"smooth",

                block:"center"

            });

            botao.classList.add("piscar");

            setTimeout(()=>{

                botao.classList.remove(
                    "piscar"
                );

            },2500);

        }

    },150);

});

// ======================================================
// SURPRESINHA
// ======================================================

document
.getElementById("btnAleatorio")
.addEventListener("click",()=>{

    let numero;

    do{

        numero =
        Math.floor(
            Math.random()*6000
        )+1;

    }while(
        numerosSelecionados.includes(
            numero
        )
    );

    paginaAtual =
    Math.ceil(
        numero/
        NUMEROS_POR_PAGINA
    );

    carregarPagina();

    carregarStatusPagina();

    setTimeout(()=>{

        const botao =
        document.querySelector(
            `[data-numero="${numero}"]`
        );

        selecionarNumero(
            numero,
            botao
        );

    },100);

});

// ======================================================
// TELEFONE
// ======================================================

const telefone =
document.getElementById("telefone");

telefone.addEventListener("input",()=>{

    let valor =
    telefone.value
    .replace(/\D/g,"");

    valor =
    valor.substring(0,11);

    if(valor.length>2){

        valor =
        "("+
        valor.substring(0,2)+
        ") "+
        valor.substring(2);

    }

    if(valor.length>10){

        valor =
        valor.substring(0,10)
        +"-"+
        valor.substring(10);

    }

    telefone.value =
    valor;

});

// ======================================================
// VALIDAÇÃO
// ======================================================

function validarFormulario(){

    const nome =
    document
    .getElementById("nome")
    .value
    .trim();

    const telefone =
    document
    .getElementById("telefone")
    .value
    .trim();

    const vendedor =
    document
    .getElementById("vendedor")
    .value
    .trim();

    if(nome.length<3){

        alert("Informe seu nome.");

        return false;

    }

    if(telefone.length<15){

        alert("WhatsApp inválido.");

        return false;

    }

    if(vendedor.length<3){

        alert("Informe o vendedor.");

        return false;

    }

    if(
        numerosSelecionados.length==0
    ){

        alert(
            "Escolha pelo menos um número."
        );

        return false;

    }

    return true;

}
// ======================================================
// SUPABASE - STATUS DOS NÚMEROS
// ======================================================

let numerosIndisponiveis = [];


// Buscar números ocupados

async function carregarNumerosBanco(){

    try{

        const { data, error } =
        await supabase
        .from("rifas")
        .select("numero,status")
        .in(
            "status",
            [
                "reservado",
                "pago"
            ]
        );


        if(error){

            console.log(error);

            return;

        }


        numerosIndisponiveis =
        data.map(
            item=>item.numero
        );


        atualizarQuantidadeDisponivel();

        carregarPagina();


    }catch(e){

        console.log(
            "Erro Supabase",
            e
        );

    }

}


// ======================================================
// MARCAR NÚMEROS BLOQUEADOS
// ======================================================

async function carregarStatusPagina(){


    const botoes =
    document.querySelectorAll(
        ".numero"
    );


    botoes.forEach(botao=>{


        const numero =
        Number(
            botao.dataset.numero
        );


        if(
            numerosIndisponiveis
            .includes(numero)
        ){


            botao.classList.add(
                "bloqueado"
            );


            botao.innerHTML =
            "🔒 "+
            formatarNumero(numero);


            botao.disabled=true;


        }


    });


}


// ======================================================
// CONTADOR DE DISPONÍVEIS
// ======================================================

function atualizarQuantidadeDisponivel(){


    const disponiveis =
    TOTAL_NUMEROS -
    numerosIndisponiveis.length;


    const elemento =
    document.getElementById(
        "disponiveis"
    );


    if(elemento){

        elemento.innerHTML =
        `🟢 ${disponiveis} números disponíveis`;

    }


}


// ======================================================
// SOBRESCREVER SELEÇÃO
// ======================================================


const selecionarOriginal =
selecionarNumero;


selecionarNumero=function(
    numero,
    botao
){


    if(
        numerosIndisponiveis
        .includes(numero)
    ){

        alert(
            "Esse número já foi vendido."
        );

        return;

    }


    selecionarOriginal(
        numero,
        botao
    );


};



// ======================================================
// INICIAR SISTEMA
// ======================================================

carregarNumerosBanco();
// ======================================================
// ======================================================
// FINALIZAR COMPRA
// RESERVA + MERCADO PAGO
// ======================================================

document
.getElementById("comprar")
.addEventListener("click", async ()=>{


    if(!validarFormulario()){

        return;

    }



    const nome =
    document
    .getElementById("nome")
    .value
    .trim();



    const telefone =
    document
    .getElementById("telefone")
    .value
    .trim();



    const vendedor =
    document
    .getElementById("vendedor")
    .value
    .trim();



    const valor =
    numerosSelecionados.length *
    VALOR_NUMERO;



    const dadosCompra = {


        nome,

        telefone,

        vendedor,

        numeros:
        numerosSelecionados,


        valor


    };



    const botao =
    document.getElementById("comprar");



    try{


        botao.disabled = true;


        botao.innerHTML =
        "⏳ Reservando números...";



        // ==========================
        // 1 - RESERVAR NO SUPABASE
        // ==========================


        const reserva =
        await fetch(

            "/api/reservar",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:
                JSON.stringify(
                    dadosCompra
                )

            }

        );



        const respostaReserva =
        await reserva.json();



        if(!respostaReserva.sucesso){


            alert(
                respostaReserva.error ||
                "Erro ao reservar números"
            );


            botao.disabled=false;


            botao.innerHTML =
            "💳 FINALIZAR COMPRA";


            return;

        }



        // ==========================
        // 2 - CRIAR PAGAMENTO
        // ==========================


        botao.innerHTML =
        "💳 Criando pagamento...";



        const pagamento =
        await fetch(

            "/api/checkout",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },

                body:
                JSON.stringify(
                    dadosCompra
                )

            }

        );



        const respostaPagamento =
        await pagamento.json();



        if(respostaPagamento.url){


            window.location.href =
            respostaPagamento.url;


        }else{


            alert(
                "Erro ao criar pagamento"
            );


            botao.disabled=false;


            botao.innerHTML =
            "💳 FINALIZAR COMPRA";


        }



    }catch(error){


        console.log(error);


        alert(
            "Erro de conexão"
        );


        botao.disabled=false;


        botao.innerHTML =
        "💳 FINALIZAR COMPRA";


    }


});