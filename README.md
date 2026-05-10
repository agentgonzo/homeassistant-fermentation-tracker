# Fermentation Tracker Card

A Home Assistant Lovelace card for monitoring fermentation hydrometers such as the iSpindel, Tilt Hydrometer, and RAPT Pill.

## Features

- Device picker filtered to fermentation devices only
- Displays specific gravity (SG) with optional Plato or Brix conversion
- Temperature display
- Attenuation and ABV calculation (when original gravity is set)
- 72-hour gravity trend graph

## Installation

Install via [HACS](https://hacs.xyz) by adding this repository as a custom Dashboard repository.

## Configuration

| Option | Description |
|---|---|
| Device | Your fermentation hydrometer device |
| Card title | Optional name override |
| Also show gravity as | Show Plato or Brix alongside SG |
| Original Gravity | Enter OG to enable attenuation and ABV display |
| Show graph | Toggle the 72h gravity history graph |
