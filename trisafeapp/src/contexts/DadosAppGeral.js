'use strict';

import { cond } from "react-native-reanimated";

export const DADOS_CLIENTE = {
    'id_cliente_iter': '',
    'cpf': '', 
    'email': '', 
    'nome': '', 
    'cpf': '', 
    'email': '', 
    'nome_usuario': '',
    'telefone': '',
    'cidade': '',
    'rua': '',
    'numero': '',
    'complemento': '',
    'bairro': '',
    'cep': '',
    'uf': '',
};

export const DADOS_PRODUTO = {
    'codigo': '',
    'nome': '',
    'valor': '',
    'tipo': '',
};

export const DADOS_PRODUTOS_CONTRATADOS = [DADOS_PRODUTO];

export const DADOS_CONTRATO = {
    'id_contrato': '',
    'cliente': DADOS_CLIENTE,
    'produtos_contratados': DADOS_PRODUTOS_CONTRATADOS,
    'valor_total': 0.0,
    'charge_id' : '',
    'url_pdf': '',
    'dt_hr_inclusao' : '',
    'ult_atualizacao' : '',
};

export const DADOS_BOLETO = {
    'url_pdf': '',
    'url_html': '',
};

export const DADOS_FOTOS = {
    'uri_local_cnh': '',
    'foto_cnh_base64': '',    
    'uri_local_doc_veiculo': '',
    'foto_doc_veiculo': '',
};

export const DADOS_CONTROLE_APP = {
    'em_producao': false,
    'processando_requisicao': false,
    'novo_cadastro': true,
    'autenticado': false,
    'abrir_camera': false,
    'exibir_foto': true,
};

export const DADOS_INSTRUCAO_USUARIO = {
    'texto_instrucao': '',
};

export const CHAVES = {
    'chave_trisafe': 'jNFjYQWDbUZk1V9Y',    
    'token_trisafe': '',
    'chave_iter': 'bUZk1V9YjNFjYQWD',
    'token_iter': '',
    'chave_clicksign': '1V9YjbYQWDkUZNFj',    
    'token_clicksign': ''
};

export const ESTADO = {
    ok: false,
    mensagem: 'Falha de comunicação. Nenhum dado foi recebido.',
    cod_mensagem: '0',
    http_status: '0'
}

export const DADOS_APP_GERAL = {
    dados_app: {
        cliente: DADOS_CLIENTE,
        contrato: DADOS_CONTRATO,
        produtos_contratados: DADOS_PRODUTOS_CONTRATADOS,
        boleto: DADOS_BOLETO,
        controle_app: DADOS_CONTROLE_APP,
        instrucao_usuario: DADOS_INSTRUCAO_USUARIO,
        fotos: DADOS_FOTOS,
        chaves: CHAVES,
    },
    registros_log: null,
};

export function clonarObjeto(obj) {
    let objString = JSON.stringify(obj);
    
    return JSON.parse(objString);
}