import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=False,  # Set to false for debugging
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        
        # Create a new browser context
        context = await browser.new_context()
        context.set_default_timeout(10000)
        
        # Open a new page
        page = await context.new_page()
        
        # Navigate to the game
        await page.goto("http://localhost:8005", wait_until="commit", timeout=15000)
        
        # Wait for the page to load
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            pass
        
        print("🔍 Starting XLR Connector Debug Test...")
        
        # Click 'Start New Game'
        start_button = page.locator('button:has-text("Start New Game")')
        await start_button.click()
        await page.wait_for_timeout(2000)
        
        # Select the first audio level (which has the problematic XLR connectors)
        audio_level = page.locator('.level-card').first
        await audio_level.click()
        await page.wait_for_timeout(2000)
        
        # Wait for equipment to be loaded
        await page.wait_for_timeout(3000)
        
        # Place the mixer on the canvas
        mixer_item = page.locator('#equipment-tools .equipment-item').first
        await mixer_item.drag_to(page.locator('#stage-area'))
        await page.wait_for_timeout(2000)
        
        # Place the speaker on the canvas
        speaker_item = page.locator('#equipment-tools .equipment-item').nth(1)
        await speaker_item.drag_to(page.locator('#stage-area'))
        await page.wait_for_timeout(2000)
        
        print("🔍 Equipment placed. Testing XLR connector interactions...")
        
        # Test 1: Check if XLR connectors are visible and properly positioned
        print("🔍 Test 1: Checking XLR connector visibility...")
        
        # Look for XLR input connectors on both mixer and speaker
        xlr_connectors = page.locator('.connector[data-type="xlr-in"]')
        connector_count = await xlr_connectors.count()
        print(f"🔍 Found {connector_count} XLR input connectors")
        
        if connector_count == 0:
            print("❌ ERROR: No XLR input connectors found!")
            return False
        
        # Test 2: Test hover effects on XLR connectors
        print("🔍 Test 2: Testing hover effects...")
        
        for i in range(connector_count):
            connector = xlr_connectors.nth(i)
            
            # Get initial state
            initial_transform = await connector.evaluate('el => window.getComputedStyle(el).transform')
            print(f"🔍 Connector {i+1} initial transform: {initial_transform}")
            
            # Hover over the connector
            await connector.hover()
            await page.wait_for_timeout(1000)
            
            # Check if hover effect is applied
            hover_transform = await connector.evaluate('el => window.getComputedStyle(el).transform')
            print(f"🔍 Connector {i+1} hover transform: {hover_transform}")
            
            # Check if the transform changed (indicating hover effect)
            if hover_transform != initial_transform:
                print(f"✅ Connector {i+1} hover effect working")
            else:
                print(f"❌ Connector {i+1} hover effect NOT working")
        
        # Test 3: Test click events on XLR connectors
        print("🔍 Test 3: Testing click events...")
        
        for i in range(connector_count):
            connector = xlr_connectors.nth(i)
            
            # Click the connector
            await connector.click()
            await page.wait_for_timeout(1000)
            
            # Check if connector shows selected state
            has_selected_class = await connector.evaluate('el => el.classList.contains("selected")')
            if has_selected_class:
                print(f"✅ Connector {i+1} click event working")
            else:
                print(f"❌ Connector {i+1} click event NOT working")
        
        # Test 4: Test connection creation between XLR connectors
        print("🔍 Test 4: Testing XLR connection creation...")
        
        # Click first XLR connector to start connection
        first_connector = xlr_connectors.first
        await first_connector.click()
        await page.wait_for_timeout(1000)
        
        # Click second XLR connector to complete connection
        if connector_count > 1:
            second_connector = xlr_connectors.nth(1)
            await second_connector.click()
            await page.wait_for_timeout(2000)
            
            # Check if connection line was created
            connection_lines = page.locator('.connection-line')
            line_count = await connection_lines.count()
            print(f"🔍 Connection lines created: {line_count}")
            
            if line_count > 0:
                print("✅ XLR connection creation working")
            else:
                print("❌ XLR connection creation NOT working")
        
        # Test 5: Test for flickering during hover
        print("🔍 Test 5: Testing for flickering...")
        
        # Rapidly hover over and out of XLR connectors
        for i in range(5):
            connector = xlr_connectors.first
            await connector.hover()
            await page.wait_for_timeout(200)
            await page.mouse.move(100, 100)  # Move away
            await page.wait_for_timeout(200)
        
        print("✅ Flickering test completed")
        
        # Test 6: Check CSS properties for top-positioned connectors
        print("🔍 Test 6: Checking CSS properties...")
        
        for i in range(connector_count):
            connector = xlr_connectors.nth(i)
            
            # Check position
            position = await connector.evaluate('el => el.dataset.position')
            print(f"🔍 Connector {i+1} position: {position}")
            
            # Check z-index
            z_index = await connector.evaluate('el => window.getComputedStyle(el).zIndex')
            print(f"🔍 Connector {i+1} z-index: {z_index}")
            
            # Check pointer-events
            pointer_events = await connector.evaluate('el => window.getComputedStyle(el).pointerEvents')
            print(f"🔍 Connector {i+1} pointer-events: {pointer_events}")
            
            # Check if it's a top connector
            if position == 'top':
                print(f"🔍 Connector {i+1} is top-positioned - checking for transform conflicts...")
                
                # Check transform property
                transform = await connector.evaluate('el => window.getComputedStyle(el).transform')
                print(f"🔍 Top connector {i+1} transform: {transform}")
                
                # Check margin-left (should be used instead of transform for positioning)
                margin_left = await connector.evaluate('el => window.getComputedStyle(el).marginLeft')
                print(f"🔍 Top connector {i+1} margin-left: {margin_left}")
        
        print("✅ CSS property check completed")
        
        # Test 7: Test equipment hover interference
        print("🔍 Test 7: Testing equipment hover interference...")
        
        # Find equipment with XLR connectors
        equipment_with_xlr = page.locator('.equipment:has(.connector[data-type="xlr-in"])')
        equipment_count = await equipment_with_xlr.count()
        print(f"🔍 Found {equipment_count} equipment with XLR connectors")
        
        for i in range(equipment_count):
            equipment = equipment_with_xlr.nth(i)
            
            # Hover over equipment
            await equipment.hover()
            await page.wait_for_timeout(1000)
            
            # Try to hover over XLR connector while equipment is hovered
            xlr_on_equipment = equipment.locator('.connector[data-type="xlr-in"]')
            if await xlr_on_equipment.count() > 0:
                await xlr_on_equipment.first.hover()
                await page.wait_for_timeout(1000)
                
                # Check if connector hover effect still works
                connector_transform = await xlr_on_equipment.first.evaluate('el => window.getComputedStyle(el).transform')
                print(f"🔍 Equipment {i+1} XLR connector transform during equipment hover: {connector_transform}")
        
        print("✅ Equipment hover interference test completed")
        
        print("🎉 XLR Connector Debug Test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False
        
    finally:
        # Clean up resources
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

if __name__ == "__main__":
    asyncio.run(run_test())
