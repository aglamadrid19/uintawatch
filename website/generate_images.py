#!/usr/bin/env python3
import os
from io import BytesIO
from google import genai
from google.genai import types
from PIL import Image

API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3-pro-image"  # Nano Banana Pro

prompts = [
    {
        "name": "hero-sensor",
        "prompt": "A single large-format editorial photograph taken at golden hour in the Utah canyon country. A compact weatherproof solar-powered electronic sensor device mounted on a rugged metal pole sits in the foreground on a windswept ridge, red indicator light glowing softly. In the background, the vast red rock canyons and sagebrush flats of Utah extend to the distant alpine ridgelines. The sky has warm amber haze and wispy clouds. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 4:3.",
        "aspect": "4:3",
        "size": "2K",
    },
    {
        "name": "wildfire-sky",
        "prompt": "A large-format editorial photograph of a wildfire smoke column rising dramatically over Utah's forested mountain ranges at dusk. The smoke plume is illuminated by the last orange rays of the setting sun, backlit to create a luminous amber atmosphere. In the foreground, scorched pine trees silhouetted against the blaze. Thick smoke billows into a deep blue-violet twilight sky. Raw, photojournalistic style, fine-art photography, hyper-realistic. Shot on large format camera, extreme detail. Aspect ratio 16:9.",
        "aspect": "16:9",
        "size": "2K",
    },
    {
        "name": "community-network",
        "prompt": "A wide panoramic editorial photograph of Utah's mountainous wildland-urban interface stretching toward a dramatic stormy sky. Multiple small glowing emitter nodes (solar-powered IoT sensor units) mounted on wooden posts and rock outcrops are scattered across the sweeping landscape, connected by faint mesh-network signal waves visualized as fine golden lines between them. A small distant community of homes sits in the valley below the ridge. Dramatic, contemplative, photojournalistic style, ultra-deep focus, large format photography. Aspect ratio 21:9.",
        "aspect": "21:9",
        "size": "2K",
    },
    {
        "name": "aftermath-empty",
        "prompt": "A stark, contemplative large-format editorial photograph of the aftermath of a wildfire in Utah's high desert. Scorched earth, white ash, and blackened burnt timber stretch across the landscape. In the middle distance, the gutted upright frame of a rural home stands alone, its windows blown out. Green sagebrush and native grasses are slowly reclaiming the edges of the burn scar. Harsh late afternoon light creates strong contrast. The sky is clear blue with a faint haze. Powerful, somber, fine-art photography. Shot on large format camera. Aspect ratio 3:2.",
        "aspect": "3:2",
        "size": "2K",
    },
    {
        "name": "solar-sensor-closeup",
        "prompt": "A detailed editorial product photograph of a small ruggedized solar-powered environmental sensor unit with a visible antenna, small status LEDs, and a sensing probe, sitting on a natural stone surface in the Utah high desert. The device is weather-sealed in a matte olive-green enclosure. Wildflowers and sagebrush frame the composition. The sky is a deep saturated blue with dramatic cloud formations. Photorealistic, warm natural light, ultra-sharp focus, large format camera quality. Aspect ratio 3:4.",
        "aspect": "3:4",
        "size": "2K",
    },
    {
        "name": "run-sensor-node",
        "prompt": "A large-format editorial photograph taken at golden hour on a windswept ridge in the Utah high desert. A woman in a plaid work shirt crouches beside a weathered wooden fence post, holding a compact ruggedized mesh sensor node — a small black handheld LoRa radio with a round OLED screen and a stubby antenna, wired to a small blue polycrystalline solar panel inside a weather-sealed olive-grey enclosure. She is pairing the device with her smartphone, the mesh-network app glowing on screen. Sagebrush, red rock hills, and a distant alpine ridgeline fill the background. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 1:1.",
        "aspect": "1:1",
        "size": "2K",
    },
    {
        "name": "sensor-node-build",
        "prompt": "A large-format editorial photograph of a community electronics workbench in warm afternoon light. On a worn wooden table: a compact black LoRa mesh radio with a round OLED screen and a stubby antenna, a tiny square BME688 gas-sensor breakout board on a Grove cable, a small blue polycrystalline solar panel, a bare 18650 lithium battery, a small green TP4056 charge controller board, and a printed assembly guide on a clipboard. A hobbyist's hands carefully plug the sensor into the device's Grove port. Shallow depth of field, dust motes in the light. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 1:1.",
        "aspect": "1:1",
        "size": "2K",
    },
    {
        "name": "report-smoke-fire",
        "prompt": "A large-format documentary editorial photograph of a hiker standing on a rocky viewpoint in Utah's red rock canyon country, holding a smartphone up toward a distant thin smoke plume rising beyond the far ridgeline. Mid-afternoon haze, long shadows across the sagebrush flat below, a hazy blue sky. Candid, real-world, a sense of quiet vigilance. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 1:1.",
        "aspect": "1:1",
        "size": "2K",
    },
    {
        "name": "develop-software",
        "prompt": "A large-format editorial photograph of a developer working at a desk at dusk in a warm home office. Hands over a laptop keyboard, the screen showing a map of a sensor mesh network with scattered green pins across a Utah landscape, a sidebar alert feed, and an open code editor. A steaming mug and a small printed circuit board sit beside the laptop; a desk lamp casts warm amber light. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 1:1.",
        "aspect": "1:1",
        "size": "2K",
    },
    {
        "name": "educate-organize",
        "prompt": "A large-format documentary editorial photograph of a community demo night in a small Utah community hall. A volunteer stands beside a table demonstrating a small solar-powered mesh sensor node to a small circle of neighbors, including a local firefighter in uniform, while a laptop behind them shows a live map of sensor nodes. Warm indoor evening light, folding chairs, a casual and earnest atmosphere. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 1:1.",
        "aspect": "1:1",
        "size": "2K",
    },
    {
        "name": "deploy-sensor",
        "prompt": "A large-format editorial photograph taken at golden hour of a person in work clothes and a ball cap standing on a windswept ridge in Utah, strapping a weatherproof olive-grey enclosure with a small polycrystalline solar panel and antenna to a sturdy wooden post with heavy-duty zip ties. A tool pouch hangs from their belt. Below, red rock canyons and pine forest stretch to distant alpine ridgelines, warm amber haze in the sky. Photorealistic, fine-art photography style shot on 8x10 view camera, ultra-high resolution, dramatic natural lighting, editorial. Aspect ratio 1:1.",
        "aspect": "1:1",
        "size": "2K",
    },
]

for item in prompts:
    out_path = f"public/images/{item['name']}.png"
    print(f"\n--- Generating: {item['name']} ---")
    print(f"Prompt: {item['prompt'][:80]}...")

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=item["prompt"],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=item["aspect"],
                    image_size=item["size"],
                ),
            ),
        )

        for part in response.candidates[0].content.parts:
            if part.text:
                print(f"  Text: {part.text}")
            elif part.inline_data:
                image_data = part.inline_data.data
                image = Image.open(BytesIO(image_data))
                image.save(out_path)
                print(f"  Saved: {out_path} ({image.size[0]}x{image.size[1]})")

    except Exception as e:
        print(f"  ERROR: {e}")