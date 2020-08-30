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

export const DADOS_CONTROLE_APP = {
    'em_producao': false,
    'processando_requisicao': false,
    'novo_cadastro': true,
    'autenticado': false
};

export const DADOS_INSTRUCAO_USUARIO = {
    'texto_instrucao': 'Bem vindo a Trisafe.'
};

export const CHAVES = {
    'chave_trisafe': 'jNFjYQWDbUZk1V9Y',    
    'token_trisafe': '',
    'chave_iter': 'bUZk1V9YjNFjYQWD',    
    'token_iter': ''
};

export const DADOS_APP_GERAL = {
    dados_app: {
        cliente: DADOS_CLIENTE,
        contrato: DADOS_CONTRATO,
        produtos_contratados: DADOS_PRODUTOS_CONTRATADOS,
        boleto: DADOS_BOLETO,
        controle_app: DADOS_CONTROLE_APP,
        instrucao_usuario: DADOS_INSTRUCAO_USUARIO,
        chaves: CHAVES,
    },
    registros_log: null,
};

export function clonarObjeto(obj) {
    let objString = JSON.stringify(obj);
    
    return JSON.parse(objString);
}