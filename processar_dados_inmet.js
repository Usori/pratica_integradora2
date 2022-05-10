/* referencias
leitura de arquivo: https://nodejs.dev/learn/reading-files-with-nodejs
print sem quebra de linha: https://stackoverflow.com/questions/6157497/node-js-printing-to-console-without-a-trailing-newline
concatenar dicionarios js: https://stackoverflow.com/questions/43449788/how-do-i-merge-two-dictionaries-in-javascript
*/
const fs = require('fs')
const lista_arquivos = "lista_arquivos.txt" // txt contendo todos os nomes dos arquivos do INMET coletados
const path_dados = "dados_mensais_inmet/" // path da pasta com os arquivos do INMET
const ARQUIVO_SAIDA = "dados_meteorologicos_2021.csv"

// parametros de leitura do arquivo
DELIMITADOR_REGISTRO = '\n'
DELIMITADOR_COLUNA = ';'
CODIFICACAO = 'utf-8'

// cabecalho
DATA = 0; TEMP_MAX = 3; TEMP_MIN = 4; CHUVA = 18;
ROTULO = [DATA, TEMP_MAX, TEMP_MIN, CHUVA]

const nomes_arquivos_raw = fs.readFileSync(lista_arquivos, CODIFICACAO) // leitura da lista de arquivos do INMET

const nomes_arquivos = nomes_arquivos_raw.split(DELIMITADOR_REGISTRO) // obtem os nomes dos arquivos do INMET e coloca em um vetor

const dados_mensal = nomes_arquivos.map( mes => path_dados+mes) // path + nome_arquivo

// permite exibir um registro selecionando previamente os rotulos
function print_registro(registro, rotulo){
    let i = 0;
    for(i = 0; i< rotulo.length-1; i++){
        process.stdout.write(registro[rotulo[i]] + DELIMITADOR_COLUNA + " ")
    }
    console.log(registro[rotulo[i]])
}

// dado uma lista de registros, exibe esses registros com a formatacao do print_registro
function print_lista_registro(lista_registros, pos_a, pos_b, rotulo){
    for(i=pos_a; i<=pos_b; i++){
        print_registro(lista_registros[i], rotulo)
    }
}
// funcao para processar os dados mensais do INMET
function processar_dados_inmet(path_arquivo_mensal_inmet){
    arquivo_mes = fs.readFileSync(path_arquivo_mensal_inmet, CODIFICACAO) // leitura do dado mensal do INMET

    registros_mes = arquivo_mes.split('\n') // arquivo mensal separado em registros por linhas
    registros_mes = registros_mes.map( registro => registro.split(DELIMITADOR_COLUNA)) // registros em vetores
    
    return registros_mes
}

// remove as aspas duplas de cada coluna do registro oriundas de rotulo
function limpar_registro(registro, rotulo){
    for(i = 0; i < rotulo.length; i++){
        registro[rotulo[i]] = registro[rotulo[i]].replace(/"/g,"") // remove aspas
        registro[rotulo[i]] = registro[rotulo[i]].replace(/,/g,".") // troca o separador decimal
    }
}

// (desativado) agrupa registros em um dicionario por data
function agrupar_registros_por_data(registros_mes){

    dicionario_registros = {}

    registros_mes.forEach( registro => {
        limpar_registro(registro, ROTULO)
        if(dicionario_registros[registro[DATA]] === undefined){
            dicionario_registros[registro[DATA]] = [];
        }
        dicionario_registros[registro[DATA]].push(registro);
    })
    return dicionario_registros
}

function sumarizar_dicionario_registros(dicionario_registros){
    dicionario_sumarizado = {}

    for(chave in dicionario_registros){
        lista_registros = dicionario_registros[chave]
        registro_simplificado = {}
        registro_simplificado['TEMP_MAX'] = 0
        registro_simplificado['TEMP_MIN'] = 0
        registro_simplificado['CHUVA'] = 0
        num_registros = 0

        lista_registros.forEach( registro => {
            reg_temp_max = parseFloat(registro[TEMP_MAX]);
            reg_temp_min = parseFloat(registro[TEMP_MIN]);
            reg_chuva = parseFloat(registro[CHUVA]);

            if(isNaN(reg_temp_max) || isNaN(reg_temp_min) || isNaN(reg_chuva)){
                return
            }

            num_registros += 1
            registro_simplificado['TEMP_MAX'] += reg_temp_max;
            registro_simplificado['TEMP_MIN'] += reg_temp_min;
            registro_simplificado['CHUVA'] += reg_chuva;
        })

        registro_simplificado['TEMP_MAX'] /= num_registros;
        registro_simplificado['TEMP_MIN'] /= num_registros;
        registro_simplificado['CHUVA'] /= num_registros;
        dicionario_sumarizado[chave] = registro_simplificado
    }

    return dicionario_sumarizado
}

function salvar_dicionario_datas(dicionario_datas){
    dados_saida = ""
    count = 0
    for(chave in dicionario_datas){
        if(count == 0){
            count += 1
            continue
        }
        
        registro = dicionario_datas[chave]
        linha_saida = chave 
        linha_saida += DELIMITADOR_COLUNA + registro['TEMP_MAX'].toFixed(1)
        linha_saida += DELIMITADOR_COLUNA + registro['TEMP_MIN'].toFixed(1)
        linha_saida += DELIMITADOR_COLUNA + registro['CHUVA'].toFixed(1)
        if(count != 365){
            linha_saida += "\n"
        }
        dados_saida += linha_saida
        count += 1
    }
    fs.writeFile(ARQUIVO_SAIDA, dados_saida, err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
}

// funcao principal do programa
function main(){
    // le todos os arquivos do inmet e os coloca em um array
    registros_mensais = []
    for(i = 0; i < dados_mensal.length; i++){
        registro_mes = processar_dados_inmet(dados_mensal[i])
        registros_mensais.push(registro_mes) // append
    }
    
    // transforma listas de registros em dicionarios de registros agrupados por data, chave = data
    dicionario_geral = {}
    for(k = 0; k < registros_mensais.length; k++){
        dicionario_agrupado = agrupar_registros_por_data(registros_mensais[k])
        dicionario_geral = Object.assign({}, dicionario_geral, dicionario_agrupado)
    }

    dicionario_datas = sumarizar_dicionario_registros(dicionario_geral)

    salvar_dicionario_datas(dicionario_datas)
   
    console.log("Arquivo salvo com sucesso")
}

// ===== INICIO DA FUNCAO PRINCIPAL ===== //
main()
