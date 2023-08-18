import matplotlib.pyplot as plt
import sys

datum = [float(i) for i in sys.stdin.readline().split()]
datum.reverse()
labels = [s for s in sys.stdin.readline().split()]
labels.reverse()
name = sys.stdin.readline()
color = int(sys.stdin.readline())

if color == 14277081:
    colorCode = "black"
else:
    colorCode = '#' + str(hex(color)).replace('0x', '')

x = list(range(0, len(datum)))
y = datum

fig, ax = plt.subplots()
ax.set_axisbelow(True)
plt.xticks(x, labels)
plt.tick_params(labelsize=12)
ax.spines['left'].set_color("#696969")
ax.spines['bottom'].set_color("#696969")
plt.gca().spines['right'].set_visible(False)
plt.gca().spines['top'].set_visible(False)
ax.tick_params(axis='x', colors="#696969")
ax.tick_params(axis='y', colors="#696969")
ax.plot(x, y, marker='o', color=colorCode)
ax.grid(which="major", axis="y", color="darkgray", alpha=0.8, linestyle="--", linewidth=1)

ax.set_ylim(0)
plt.savefig('./img/temp/' + name[:-1] + '-chart.png', transparent=True)

print(name)
