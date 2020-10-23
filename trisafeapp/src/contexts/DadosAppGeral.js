'use strict';
export const DADOS_FOTO = {
    'caminho_local': '',
    'url': '',
    'foto_base64': '',
};

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
    'id_signatario_contrato': '',
    'foto_cnh': clonarObjeto(DADOS_FOTO),
};

export const DADOS_VEICULO = {
    'placa': '',
    'apelido': '',
    'foto_doc': clonarObjeto(DADOS_FOTO),
    "placa": '',
    "modelo": '',
    "cliente": DADOS_CLIENTE,
    "marca": '',
    "ano": '',
};

export const DADOS_VEICULOS = [DADOS_VEICULO];

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
    'aceito': false,
    'chave_boleto_ext' : '',
    'dt_hr_inclusao' : '',
    'ult_atualizacao' : '',
    'url_pdf': '',
    'url_doc': '',
};

export const DADOS_BOLETO = {
    'url_pdf': '',
    'url_doc':'',
    'url_html': '',
};

export const DADOS_MENSAGEM_MODAL = {
    exibir_modal : false,
    mensagem : '',
    botoes : []
}

export const DADOS_BOTAO = {
    texto: '',
    funcao: null
}

export const DADOS_CONTROLE_APP = {
    app_ativo: true,
    em_producao: false,
    processando_requisicao: false,
    novo_cliente: false,
    novo_veiculo: false,
    cadastrando_cliente: false,
    cadastrando_veiculo: false,
    autenticado: false,
    abrir_camera: false,
    exibir_foto: true,
    exibir_modal: false,
    config_modal: DADOS_MENSAGEM_MODAL,
    tela_na_horizontal: false
};

export const DADOS_INSTRUCAO_USUARIO = {
    texto_instrucao: '',
};

export const CHAVES = {
    chave_trisafe: 'jNFjYQWDbUZk1V9Y',    
    token_trisafe: '',
    chave_iter: 'bUZk1V9YjNFjYQWD',
    token_iter: '',
    chave_clicksign: '1V9YjbYQWDkUZNFj',    
    token_clicksign: ''
};

export const DADOS_DISPOSITIVO = {
    modelo: '',
    tipo_dispositivo: '',
    device_id: '',
    dispositivo: '',
    nome_dispositivo: '',
    token_dispositivo: '',
    hardware: '',
    numero_serial: '',
    nome_sistema: '',
    versao_sistema: '',
    id_unico: '',
    id_instancia: '',
    tablet: '',
    produto: '',
    fabricante: ''
}

export const ESTADO = {
    ok: false,
    mensagem: 'Falha de comunicação. Nenhum dado foi recebido.',
    cod_mensagem: '0',
    http_status: '0'
}

// export const VEICULO_ATUAL = {
//     indice_lista: -1,
//     veiculo: DADOS_VEICULO
// }

export const DADOS_APP_GERAL = {
    dados_app: {
        cliente: DADOS_CLIENTE,
        veiculo_atual: DADOS_VEICULO,
        veiculos: DADOS_VEICULOS,
        contrato: DADOS_CONTRATO,
        produtos_contratados: DADOS_PRODUTOS_CONTRATADOS,
        boleto: DADOS_BOLETO,
        controle_app: DADOS_CONTROLE_APP,
        instrucao_usuario: DADOS_INSTRUCAO_USUARIO,
        foto: DADOS_FOTO,
        chaves: CHAVES,
        dados_dispositivo: DADOS_DISPOSITIVO,
    },
};

export function clonarObjeto(obj) {
    let objString = JSON.stringify(obj);
    
    return JSON.parse(objString);
}