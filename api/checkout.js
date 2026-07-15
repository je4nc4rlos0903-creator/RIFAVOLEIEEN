// api/checkout.js

import { MercadoPagoConfig, Preference } from "mercadopago";


// =====================================
// MERCADO PAGO
// =====================================

const client = new MercadoPagoConfig({

    accessToken:
    process.env.MP_ACCESS_TOKEN

});


// =====================================
// API CHECKOUT
// =====================================

export default async function handler(req, res) {


    if(req.method !== "POST"){

        return res.status(405).json({

            error:
            "Método não permitido"

        });

    }


    try {


        const {

            nome,

            telefone,

            vendedor,

            numeros,

            valor


        } = req.body;



        // Validação

        if(

            !nome ||

            !telefone ||

            !vendedor ||

            !numeros ||

            numeros.length === 0 ||

            !valor

        ){

            return res.status(400).json({

                error:
                "Dados incompletos"

            });

        }



        // Cria referência para o webhook

        const referencia = JSON.stringify({

            numeros,

            nome,

            telefone,

            vendedor

        });



        const preference =
        new Preference(client);



        const pagamento =
        await preference.create({


            body:{


                items:[

                    {

                        title:
                        "Rifa - Prêmio R$ 1.000,00",


                        quantity:1,


                        unit_price:
                        Number(valor)


                    }

                ],



                payer:{


                    name:
                    nome,


                    phone:{


                        number:
                        telefone


                    }


                },



                external_reference:
                referencia,



                back_urls:{


                    success:

                    `${process.env.SITE_URL}/sucesso.html`,



                    failure:

                    `${process.env.SITE_URL}/comprar.html`,



                    pending:

                    `${process.env.SITE_URL}/comprar.html`


                },



                auto_return:
                "approved"


            }


        });



        return res.status(200).json({


            url:
            pagamento.init_point


        });



    } catch(error){



        console.log(
            "Erro Mercado Pago:",
            error
        );



        return res.status(500).json({

            error:
            "Erro ao criar pagamento"

        });


    }


}