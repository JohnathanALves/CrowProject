#!/usr/bin/env python
""" Cria uma matriz e calcula seu determinante. """

import argparse    # Capturar argumento da linha de comando
import time        # Calcular a data atual e o tempo de execução
import numpy as np # Gerar a matriz aleatória

PARSER = argparse.ArgumentParser(description='Cria uma matriz e calcula seu determinante.')

PARSER.add_argument('lin', help='quantidade de linhas da matriz')
PARSER.add_argument('col', help='quantidade de colunas da matriz')
ARGS = PARSER.parse_args()

# Arquivo de logs para controle
LOG = open('pylogs.txt', 'a+')

START_TIME = time.time()

# Função consumidora de tempo
np.linalg.slogdet(np.empty([int(ARGS.lin), int(ARGS.col)]))
END_TIME = time.time()

LOG.write('Data: ' + time.strftime('%c') + '; tempo: ' + str(END_TIME - START_TIME) + '\n')
LOG.close()
