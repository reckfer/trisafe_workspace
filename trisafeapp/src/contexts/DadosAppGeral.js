export const DADOS_CLIENTE = {
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
    'processando_requisicao': false,
}

export const DADOS_APP_GERAL = {
    'dados_app': {
        'cliente': DADOS_CLIENTE,
        'contrato': DADOS_CONTRATO,
        'produtos_contratados': DADOS_PRODUTOS_CONTRATADOS,
        'boleto': DADOS_BOLETO,
        'controle_app': DADOS_CONTROLE_APP,
    },
    'dados_log':{
        'config_log': {},
        'registros_log': [{
            'registro_log':  {
                'data_hora': '',
                'mensagem_log' : '',
            }
        }],
    }
};

