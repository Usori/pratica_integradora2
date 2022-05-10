const fs = require('fs')
const arquivo_entrada = "dados_meteorologicos_2021.csv"

DELIMITADOR_REGISTRO = '\n'
DELIMITADOR_COLUNA = ';'
CODIFICACAO = 'utf-8'

DATA = 0; TEMP_MAX = 1; TEMP_MIN = 2; CHUVA = 3;
ROTULO = [DATA, TEMP_MAX, TEMP_MIN, CHUVA]

const dados_raw = fs.readFileSync(arquivo_entrada, CODIFICACAO) // leitura da lista de arquivos do INMET
lista_registros = dados_raw.split(DELIMITADOR_REGISTRO)
lista_registros = lista_registros.map( registro => registro.split(DELIMITADOR_COLUNA)) // registros em vetores

function filtrar_por_valor_maior(vetor_feature, valor_feature){
    vetor_filtrado = vetor_feature.filter(feature => feature > valor_feature)
    return vetor_filtrado
}

// funcao principal
function main(){
    
    vetor_temperaturas = []
    vetor_chuva = []
    temperatura_filtro = 20 // no exemplo pediasse 30 graus, mas utilizei temp_media diaria de SP como entrada
    filtro_chuva_mm = 0 // verifica quando choveu, indice (mm) > 0

    for(i = 0 ; i < lista_registros.length; i++){
        registro = lista_registros[i]
        reg_temp_max = parseFloat(registro[TEMP_MAX])
        reg_temp_min = parseFloat(registro[TEMP_MIN])
        temperatura_media = parseFloat(((reg_temp_max+reg_temp_min)/2).toFixed(1))

        reg_chuva = parseFloat(parseFloat(registro[CHUVA]).toFixed(1))

        vetor_temperaturas.push(temperatura_media)
        vetor_chuva.push(reg_chuva)
    }

    vetor_temperaturas_filtradas = filtrar_por_valor_maior(vetor_temperaturas, temperatura_filtro)
    vetor_chuva_filtrado = filtrar_por_valor_maior(vetor_chuva, filtro_chuva_mm)

    console.log("O número de dias com temperatura maior que " +
                temperatura_filtro + " °C foi: " + vetor_temperaturas_filtradas.length + " dias.")
    console.log("Choveu em " + vetor_chuva_filtrado.length + " dias.")

}

main()