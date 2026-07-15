// api/webhook.js

import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";


// =====================================
// SUPABASE
// =====================================

const supabase = createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_SERVICE_KEY

);



// =====================================
// MERCADO PAGO
// =====================================

const client = new MercadoPagoConfig({

    accessToken:
    process.env.MP_ACCESS_TOKEN

});


const payment = new Payment(client);



// =====================================
// WEBHOOK
// =====================================

export default async function handler(req,res){


    if(req.method !== "POST"){

        return res.status(405).json({

            error:
            "Método não permitido"

        });

    }



    try{


        const { type, data } = req.body;



        if(type !== "payment"){

            return res.status(200).send("OK");

        }



        const pagamento =
        await payment.get({

            id:data.id

        });



        if(
            pagamento.status !== "approved"
        ){

            return res.status(200).send("Pendente");

        }



        const referencia =
        JSON.parse(
            pagamento.external_reference
        );



        const numeros =
        referencia.numeros;



        // Atualiza números

        await supabase

        .from("rifas")

        .update({

            status:"pago",

            pagamento_id:
            pagamento.id

        })

        .in(

            "numero",

            numeros

        );



        // Salva pagamento

        await supabase

        .from("pagamentos")

        .insert({

            user_id:
            null,

            mercado_pago_id:
            pagamento.id,

            valor:
            pagamento.transaction_amount,

            status:
            "approved"

        });



        return res.status(200).json({

            sucesso:true

        });



    }catch(error){


        console.log(error);


        return res.status(500).json({

            error:
            "Erro webhook"

        });


    }


}