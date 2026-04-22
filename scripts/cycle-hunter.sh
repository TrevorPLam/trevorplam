#!/bin/bash
madge --circular --extensions ts,js . && echo "✅ No cycles" || { echo "❌ Circular dependencies found"; exit 1; }
