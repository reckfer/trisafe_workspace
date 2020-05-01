import json
import sys
import traceback
import os
from trisafeserverapp.settings import BASE_DIR
from django.db import models
from rest_framework import status
from comum.retorno import Retorno
from cliente.models import Cliente
from produto.models import Produto
from emailcliente.models import EmailCliente
from transacaogerencianet.models import TransacaoGerenciaNet
from fpdf import FPDF

class Contrato(models.Model):
    id_contrato = models.CharField(primary_key=True, max_length=16)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, blank=False, null=False)
    produtos_contratados = models.ManyToManyField(Produto)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    charge_id = models.CharField(max_length=10, blank=False, null=True)
    dt_hr_inclusao = models.DateTimeField(blank=False, null=False, auto_now_add=True)
    ult_atualizacao = models.DateTimeField(blank=False, null=False, auto_now=True)
    aceito = models.BooleanField(default=False)
    url_pdf = models.CharField(max_length=200, blank=True, null=True)

    # Tipos de produtos
    FISICO = 'F'
    SERVICO = 'S'
    TIPOS_PRODUTO = [
        (FISICO, 'Contrato Físico'),
        (SERVICO, 'Serviço'),
    ]

    def incluir(self, chaves_produtos):

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
            self.id_contrato = str(self.cliente.id_cliente_iter).rjust(6, '0') + str(self.charge_id).rjust(10, '0')
            self.cliente = retorno_cliente.dados
            self.calcular_valor_total(retorno_produtos.dados)

            # Inclui na base
            self.save()

            # Atualiza com os produtos
            self.produtos_contratados.add(*retorno_produtos.dados)

            retorno = Retorno(True, 'Confira os dados do seu\ncontrato e clique em\nContratar para aceitá-lo.')
            retorno.dados = self

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
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
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
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
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno
    
    def obter_por_cliente(self):
        try:
            retorno = Retorno(False, 'Contrato não localizado.')
            
            m_contratos = Contrato.objects.filter(cliente__cpf=self.cliente.cpf)
            
            if m_contratos:
                m_contrato = m_contratos[0]
                if m_contrato:
                    retorno = Retorno(True)
                    retorno.dados = m_contrato
            
                    # email_cliente = EmailCliente()
                    # email_cliente.enviar_com_anexos(m_contrato.cliente)

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
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
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno
    
    def montar_contrato(self):
        try:
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
            caminho_arquivo = os.path.join(BASE_DIR, nome_arquivo)
            pdf.output(caminho_arquivo)

            dados_retorno = {
                "nome_arquivo" : nome_arquivo,
                "caminho_arquivo" : caminho_arquivo
            }

            retorno = Retorno(True)
            retorno.dados = dados_retorno

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
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