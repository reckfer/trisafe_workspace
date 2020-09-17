import json
import sys
import traceback
import os
from trisafeserverapp.settings import BASE_DIR
from django.db import models
from rest_framework import status
from comum.retorno import Retorno
from comum.credencial import Credencial
from cliente.models import Cliente
from produto.models import Produto
from emailcliente.models import EmailCliente
from contratoclicksign.models import ContratoClicksign
from fpdf import FPDF

class Contrato(models.Model):
    id_contrato = models.CharField(primary_key=True, max_length=30)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, blank=False, null=False)
    produtos_contratados = models.ManyToManyField(Produto)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    aceito = models.BooleanField(default=False)
    dt_hr_inclusao = models.DateTimeField(blank=False, null=False, auto_now_add=True)
    ult_atualizacao = models.DateTimeField(blank=False, null=False, auto_now=True)
    chave_contrato_ext = models.CharField(max_length=100, blank=False, null=True)
    chave_boleto_ext = models.CharField(max_length=100, blank=False, null=True)
    credencial = Credencial()

    def incluir(self):

        try:
            retorno_cliente = self.cliente.obter()

            if (not retorno_cliente.estado.ok):
                return retorno_cliente
            
            chave_doc = ''
            m_contrato_clicksign = ContratoClicksign(self.credencial)
            # Tenta obter o contrato da base, pelo CPF
            retorno = self.obter_por_cliente()

            if (retorno.estado.ok):

                m_contrato = retorno.dados
                chave_doc = m_contrato.chave_contrato_ext

            else:
                if retorno.estado.codMensagem != 'NaoCadastrado':
                    return retorno
                else:
                    retorno = m_contrato_clicksign.incluir(retorno_cliente.dados)

                    if not retorno.estado.ok:
                        return retorno
            
                    d_dados_doc = retorno.dados

                    if 'document' in d_dados_doc:
                        d_documento = d_dados_doc['document']
                        if 'key' in d_documento:
                            chave_doc = d_documento['key']
                        
                        self.cliente = retorno_cliente.dados
                        # Sobram 4, caso necessario mais de um contrato por cliente.
                        self.id_contrato = str(self.cliente.id_cliente_iter).rjust(6, '0') + str(self.cliente.cpf).rjust(6, '0')
                        self.chave_contrato_ext = d_documento['key']
                        self.valor_total = 0.0

                        # Inclui/atualiza na base
                        self.save()

            retorno = m_contrato_clicksign.obter(chave_doc)
            
            if not retorno.estado.ok:
                return retorno

            d_documento = retorno.dados
            
            retorno = m_contrato_clicksign.fazer_download(d_documento)

            retorno = Retorno(True, 'Contrato gerado com sucesso. Selecione "Contratar" para aceitá-lo.')
            retorno.dados = self

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, 'A inclusão do contrato falhou.', None, None, e)
            return retorno
    # def incluir(self, chaves_produtos):

    #     try:
    #         retorno_cliente = self.cliente.obter()

    #         if not retorno_cliente.estado.ok:
    #             return retorno_cliente

    #         m_produto = Produto()
    #         retorno_produtos = m_produto.listar()
            
    #         if not retorno_produtos.estado.ok:
    #             return retorno_produtos

    #         d_dados_pedido = self.gerar_dados_pedido_transacao_gerencia_net(retorno_produtos.dados)

    #         m_transacao_gerencia_net = TransacaoGerenciaNet()

    #         retorno_transacao = m_transacao_gerencia_net.incluir(d_dados_pedido)

    #         if not retorno_transacao.estado.ok:
    #             return retorno_transacao
            
    #         self.charge_id = m_transacao_gerencia_net.id            
    #         self.cliente = retorno_cliente.dados
    #         self.id_contrato = str(self.cliente.id_cliente_iter).rjust(6, '0') + str(self.charge_id).rjust(10, '0')
    #         self.calcular_valor_total(retorno_produtos.dados)

    #         # Inclui na base
    #         self.save()

    #         # Atualiza com os produtos
    #         self.produtos_contratados.add(*retorno_produtos.dados)

    #         retorno = Retorno(True, 'Contrato gerado com sucesso. Selecione "Contratar" para aceitá-lo.')
    #         retorno.dados = self

    #         return retorno
    #     except Exception as e:
                    
    #         retorno = Retorno(False, 'A inclusão do contrato falhou.', None, None, e)
    #         return retorno
    
    def alterar(self, chaves_produtos):

        try:
            retorno_cliente = self.cliente.obter()

            if not retorno_cliente.estado.ok:
                return retorno_cliente

            m_produto = Produto()
            retorno_produtos = m_produto.listar_especificos(chaves_produtos)
            
            if not retorno_produtos.estado.ok:
                return retorno_produtos

            d_dados_pedido = self.gerar_dados_pedido_transacao_gerencia_net(retorno_produtos.dados)

            m_transacao_gerencia_net = TransacaoGerenciaNet()

            retorno_transacao = m_transacao_gerencia_net.incluir(d_dados_pedido)

            if not retorno_transacao.estado.ok:
                return retorno_transacao
            
            self.charge_id = m_transacao_gerencia_net.id
            self.cliente = retorno_cliente.dados
            self.calcular_valor_total(retorno_produtos.dados)
            self.aceito = False
            # Atualiza com os produtos
            self.produtos_contratados.set(retorno_produtos.dados)

            # Inclui na base
            self.save()

            retorno = Retorno(True, 'Contrato gerado com sucesso. Selecione "Contratar" para aceitá-lo.')
            retorno.dados = self

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, 'A atualização do contrato falhou.', None, None, e)
            return retorno

    def aceitar(self):
        try:
            retorno = self.obter()

            if not retorno.estado.ok:
                return retorno
            
            m_contrato = retorno.dados
            m_contrato.aceito = True
            m_contrato.save()            

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, 'O aceite do contrato falhou.', None, None, e)
            return retorno
    
    def obter(self):
        try:
            retorno = Retorno(False, 'Contrato não localizado.')
            m_contratos = Contrato.objects.filter(id_contrato=self.id_contrato)
            
            if m_contratos:
                m_contrato = m_contratos[0]
                if m_contrato:
                    retorno = Retorno(True)
                    retorno.dados = m_contrato

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, 'A consulta do contrato falhou.', None, None, e)
            return retorno
    
    def obter_por_cliente(self):
        try:
            retorno = Retorno(False, 'Contrato não localizado.', 'NaoCadastrado')
            
            m_contratos = Contrato.objects.filter(cliente__cpf=self.cliente.cpf)
            
            if m_contratos:
                m_contrato = m_contratos[0]
                if m_contrato:
                    m_contrato.cliente.credencial = self.cliente.credencial
                    retorno = Retorno(True)
                    retorno.dados = m_contrato

            return retorno

        except Exception as e:
                    
            retorno = Retorno(False, 'A consulta do contrato falhou.', None, None, e)
            return retorno

    def calcular_valor_total(self, m_produtos):
        
        self.valor_total = 0.0

        for m_produto in m_produtos:
            self.valor_total = float(self.valor_total) + float(m_produto.valor)
    
    def gerar_dados_pedido_transacao_gerencia_net(self, m_produtos):
        produtos = []
        
        # self.valor_total = 0.0

        for m_produto in m_produtos:
            # self.valor_total = float(self.valor_total) + float(m_produto.valor)
            
            item = {
                'name': m_produto.nome,
                'value': int(float(m_produto.valor) * 100),
                'amount': 1
            }
            produtos.append(item)

        # frete = {
        #     'name': "Contrato de adesao",
        #     'value': float(self.valor_total) * 100
        # }

        d_dados_pedido = {
            'items': produtos,
            # 'shippings': frete
        }

        return d_dados_pedido
        
    def gerar_contrato_pdf(self):
        try:
            retorno_contrato = self.obter()

            if not retorno_contrato.estado.ok:
                return retorno_contrato

            self.atribuir_do_modelo(retorno_contrato.dados)

            if(not self.id_contrato or len(str(self.id_contrato)) <= 0):
                retorno_contrato = self.obter_por_cliente()

                if not retorno_contrato.estado.ok:
                    return retorno_contrato

                self.atribuir_do_modelo(retorno_contrato.dados)
            
            if(not self.id_contrato or len(str(self.id_contrato)) <= 0):
                return Retorno(False, 'Contrato não localizado para o cliente.', 'NaoCadastrado')
            
            retorno_arquivo = self.montar_contrato()
            
            if not retorno_arquivo.estado.ok:
                return retorno_arquivo

            return retorno_arquivo

        except Exception as e:
                    
            retorno = Retorno(False, 'A geração do contrato falhou.', None, None, e)
            return retorno
    
    def montar_contrato(self):
        try:
            # Exclui o arquivo anterior, se existir. 
            self.excluir_contrato()
            
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=12)
            pdf.cell(200, 10, txt="Obrigado por adquirir os produtos da TriSafe.", ln=1, align="C")

            pdf.cell(200, 10, txt= "Nome cliente: %s" % self.cliente.nome, ln=1, align="C")
            pdf.cell(200, 10, txt= "CPF: %s" % self.cliente.cpf, ln=1, align="C")
            pdf.cell(200, 10, txt= "Rua: %s" % self.cliente.rua, ln=1, align="C")
            pdf.cell(200, 10, txt= "Número: %s" % self.cliente.numero, ln=1, align="C")
            pdf.cell(200, 10, txt= "CEP: %s" % self.cliente.cep, ln=1, align="C")
            pdf.cell(200, 10, txt= "Bairro: %s" % self.cliente.bairro, ln=1, align="C")
            pdf.cell(200, 10, txt= "Cidade: %s" % self.cliente.cidade, ln=1, align="C")
            pdf.cell(200, 10, txt= "UF: %s" % self.cliente.uf, ln=1, align="C")
            pdf.cell(200, 10, txt= "Telefone: %s" % self.cliente.telefone, ln=1, align="C")
            pdf.cell(200, 10, txt= "E-mail: %s" % self.cliente.email, ln=1, align="C")

            pdf.add_page()
            pdf.set_font("Arial", size=14)
            pdf.cell(200, 10, txt="Produtos contratados...", ln=1, align="C")

            pdf.add_page()
            pdf.set_font("Arial", size=12)

            for m_produto in self.produtos_contratados.all():
                pdf.cell(200, 10, txt= "%s = %s" % (m_produto.nome, m_produto.valor), ln=1, align="C")
            
            pdf.cell(200, 10, txt= "Valor Total = %s" % self.valor_total, ln=1, align="C")
            pdf.cell(200, 10, txt= "Charge Id Boleto = %s" % self.charge_id, ln=1, align="C")
            
            nome_arquivo = "Contrato_%s.pdf" % self.id_contrato
            caminho_arquivo = os.path.join(BASE_DIR, "data", "contratos", nome_arquivo)
            pdf.output(caminho_arquivo)

            dados_retorno = {
                "nome_arquivo" : nome_arquivo,
                "caminho_arquivo" : caminho_arquivo
            }

            retorno = Retorno(True)
            retorno.dados = dados_retorno

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, 'A geração do contrato falhou.', None, None, e)
            return retorno

    def excluir_contrato(self):
        try:
            nome_arquivo = "Contrato_%s.pdf" % self.id_contrato
            caminho_arquivo = os.path.join(BASE_DIR, "data", "contratos", nome_arquivo)
            
            if(os.path.exists(caminho_arquivo)):
                os.remove(caminho_arquivo)

            caminho_diretorio = os.path.join(BASE_DIR, "data", "contratos")
            if(not os.path.exists(caminho_diretorio)):
                os.makedirs(caminho_diretorio)

            retorno = Retorno(True)
            return retorno

        except Exception as e:
                    
            retorno = Retorno(False, 'A exclusão do contrato falhou.', None, None, e)
            return retorno

    def atribuir_do_modelo(self, m_contrato):
        if m_contrato:            
            self.id_contrato = m_contrato.id_contrato
            self.cliente = m_contrato.cliente
            self.produtos_contratados.set(m_contrato.produtos_contratados.all())
            self.valor_total = m_contrato.valor_total
            self.charge_id = m_contrato.charge_id
            self.dt_hr_inclusao = m_contrato.dt_hr_inclusao
            self.ult_atualizacao = m_contrato.ult_atualizacao
            self.aceito = m_contrato.aceito
            self.url_pdf = m_contrato.url_pdf

    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        
        ret = {
            'id_contrato': self.id_contrato,
            'cliente': self.cliente.json(),
            'produtos_contratados': self.produtos_contratados.values(),
            'valor_total': self.valor_total,
            'charge_id' : self.charge_id,
            'url_pdf' : self.url_pdf,
            'dt_hr_inclusao' : self.dt_hr_inclusao,
            'ult_atualizacao' : self.ult_atualizacao,
        }
        return ret

    def __str__(self):
        return self.cliente.nome