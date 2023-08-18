import matplotlib.pyplot as plt
import numpy as np
import sys

datum = [float(i) for i in sys.stdin.readline().split()]
datum.reverse()
labels = [s for s in sys.stdin.readline().split()]
labels.reverse()
name = sys.stdin.readline()

x = list(range(0, len(datum)))
y = datum

fig, ax = plt.subplots()
plt.xticks(x, labels)
ax.plot(x, y, marker='o')


plt.savefig('./img/temp/' + name + '.svg')

print("success")
