// api/reservar.js

import { createClient } from "@supabase/supabase-js";


const supabase = createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_SERVICE_KEY

);



export default async function handler(req,res){


    if(req.method !== "POST"){

        return res.status(405).json({

            error:"Método não permitido"

        });

    }



    try{


        const {

            nome,

            telefone,

            vendedor,

            numeros


        } = req.body;



        if(

            !nome ||

            !telefone ||

            !vendedor ||

            !numeros ||

            numeros.length === 0

        ){

            return res.status(400).json({

                error:"Dados incompletos"

            });

        }



        // Limpa reservas antigas (15 minutos)

        const limite = new Date(

            Date.now() - 15 * 60 * 1000

        );



        await supabase

        .from("rifas")

        .update({

            status:"disponivel",

            user_id:null,

            reservado_em:null

        })

        .eq(

            "status",

            "reservado"

        )

        .lt(

            "reservado_em",

            limite.toISOString()

        );





        // Verifica se números estão livres

        const {data:ocupados,error}

        = await supabase

        .from("rifas")

        .select("numero,status")

        .in(

            "numero",

            numeros

        )

        .neq(

            "status",

            "disponivel"

        );



        if(error){

            throw error;

        }



        if(

            ocupados &&

            ocupados.length > 0

        ){

            return res.status(400).json({

                error:
                "Um ou mais números já foram escolhidos"

            });

        }



        // Criar comprador

        const {data:user,userError}

        = await supabase

        .from("users_rifa")

        .insert({

            nome,

            telefone,

            vendedor

        })

        .select()

        .single();



        if(userError){

            throw userError;

        }



        // Reservar números


        await supabase

        .from("rifas")

        .update({

            status:"reservado",

            user_id:user.id,

            reservado_em:
            new Date()

        })

        .in(

            "numero",

            numeros

        );



        return res.status(200).json({

            sucesso:true,

            user_id:user.id

        });



    }catch(error){


        console.log(error);


        return res.status(500).json({

            error:
            "Erro interno"

        });


    }


}