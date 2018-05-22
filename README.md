# nanoleaf-mbta
An "enchanted object" project.

<!-- TOC -->

- [nanoleaf-mbta](#nanoleaf-mbta)
  - [Introduction](#introduction)
  - [What It Does](#what-it-does)
  - [How It Works](#how-it-works)
    - [Examples](#examples)
  - [Links](#links)

<!-- /TOC -->

## Introduction
This project brings together the [Nanoleaf Aurora](https://nanoleaf.me/en/) lights and the [MBTA (Massachusetts Bay Transportation Authority)](https://www.mbta.com/) train/subway API. The project was inspired by a desire to build enchanted objects, a concept introduced to me by [David Rose](https://enchantedobjects.com/) - [David Rose's TED talk](https://www.youtube.com/watch?v=I_AhhhcceXk).

## What It Does
I live in Boston, Masachusetts, on South Huntington Avenue, just in front of the Green Line E-branch "Back of the Hill" train stop.  Using the 12 Nanoleaf Aurora lights mounted on my living room wall, this app will paint any outbound train position within a 12 minute time frame as a green triangle/panel.

![MBTA E-Line](https://github.com/forestb/nanoleaf-mbta/blob/master/assets/28165167_713515882455_824425281038214315_o.jpg)

The picture above is from inside my apartment. In this photo, there are three trains within 12 minutes. When the panel at the top is painted green, it's time to leave the apartment, and the train will be outside.

## How It Works
This runs as a Node.js console application on a timer.

### Examples
```
node .\start.js // turn on the lights; begins MBTA polling
```

```
node .\stop.js // turns off the lights
```

## Links
