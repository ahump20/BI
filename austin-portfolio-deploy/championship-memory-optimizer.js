/**
 * BLAZE INTELLIGENCE - CHAMPIONSHIP MEMORY OPTIMIZATION ENGINE
 * Revolutionary Memory Management for 60FPS 3D Performance
 * Austin Humphrey - blazesportsintel.com - Deep South Sports Authority
 */

class ChampionshipMemoryOptimizer {
    constructor() {
        this.memoryPools = {
            textures: new Map(),
            geometries: new Map(),
            materials: new Map(),
            buffers: new Map()
        };

        this.assetStreaming = {
            loadQueue: [],
            unloadQueue: [],
            activeAssets: new Set(),
            priorityLevels: ['critical', 'high', 'medium', 'low'],
            maxConcurrentLoads: 3
        };

        this.memoryThresholds = {
            critical: 400 * 1024 * 1024,    // 400MB
            warning: 300 * 1024 * 1024,     // 300MB
            optimal: 200 * 1024 * 1024,     // 200MB
            emergency: 500 * 1024 * 1024    // 500MB - trigger emergency cleanup
        };

        this.garbageCollector = {
            enabled: true,
            interval: 30000,  // 30 seconds
            aggressiveMode: false,
            lastCleanup: 0,
            cleanupHistory: []
        };

        this.textureAtlas = {
            atlas: null,
            packer: new TexturePacker(),
            needsRebuild: false,
            maxSize: 2048
        };

        this.instancedGeometry = {
            pools: new Map(),
            maxInstances: 1000
        };

        this.initialize();
    }

    initialize() {
        console.log('🚀 Championship Memory Optimizer Initializing...');

        this.detectMemoryCapabilities();
        this.setupMemoryMonitoring();
        this.initializeTexturePacking();
        this.createInstancedGeometryPools();
        this.startGarbageCollector();
        this.setupAssetStreaming();

        console.log('🏆 Memory Optimization System ACTIVE');
    }

    detectMemoryCapabilities() {
        this.capabilities = {
            jsHeapSizeLimit: 0,
            totalJSHeapSize: 0,
            usedJSHeapSize: 0,
            deviceMemory: navigator.deviceMemory || 4,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            platform: navigator.platform
        };

        if ('memory' in performance) {
            const memory = performance.memory;
            this.capabilities.jsHeapSizeLimit = memory.jsHeapSizeLimit;
            this.capabilities.totalJSHeapSize = memory.totalJSHeapSize;
            this.capabilities.usedJSHeapSize = memory.usedJSHeapSize;
        }

        // Adjust thresholds based on available memory
        const availableMemory = this.capabilities.deviceMemory * 1024 * 1024 * 1024;
        const memoryRatio = Math.min(availableMemory / (4 * 1024 * 1024 * 1024), 1); // Normalize to 4GB baseline

        Object.keys(this.memoryThresholds).forEach(key => {
            this.memoryThresholds[key] *= memoryRatio;
        });

        console.log(`💾 Detected ${this.capabilities.deviceMemory}GB device memory, ${this.capabilities.hardwareConcurrency} cores`);
    }

    setupMemoryMonitoring() {
        this.memoryMonitor = {
            lastCheck: 0,
            checkInterval: 5000, // Check every 5 seconds
            history: [],
            maxHistory: 100,
            currentUsage: 0,
            trend: 'stable' // 'increasing', 'decreasing', 'stable'
        };

        setInterval(() => {
            this.checkMemoryUsage();
        }, this.memoryMonitor.checkInterval);

        // Monitor for memory pressure events
        if ('performance' in window && 'measureUserAgentSpecificMemory' in performance) {
            this.setupAdvancedMemoryMonitoring();
        }
    }

    checkMemoryUsage() {
        if (!('memory' in performance)) return;

        const memory = performance.memory;
        const currentUsage = memory.usedJSHeapSize;
        const previousUsage = this.memoryMonitor.currentUsage;

        this.memoryMonitor.currentUsage = currentUsage;
        this.memoryMonitor.history.push({
            timestamp: Date.now(),
            usage: currentUsage,
            limit: memory.jsHeapSizeLimit,
            total: memory.totalJSHeapSize
        });

        // Trim history
        if (this.memoryMonitor.history.length > this.memoryMonitor.maxHistory) {
            this.memoryMonitor.history.shift();
        }

        // Analyze trend
        if (currentUsage > previousUsage * 1.1) {
            this.memoryMonitor.trend = 'increasing';
        } else if (currentUsage < previousUsage * 0.9) {
            this.memoryMonitor.trend = 'decreasing';
        } else {
            this.memoryMonitor.trend = 'stable';
        }

        // Trigger cleanup if needed
        if (currentUsage > this.memoryThresholds.critical) {
            this.triggerMemoryCleanup('critical');
        } else if (currentUsage > this.memoryThresholds.warning && this.memoryMonitor.trend === 'increasing') {
            this.triggerMemoryCleanup('preventive');
        }

        // Emergency cleanup
        if (currentUsage > this.memoryThresholds.emergency) {
            this.triggerEmergencyCleanup();
        }
    }

    setupAdvancedMemoryMonitoring() {
        // Use advanced memory measurement if available
        setInterval(async () => {
            try {
                const memoryInfo = await performance.measureUserAgentSpecificMemory();

                memoryInfo.breakdown.forEach(entry => {
                    if (entry.attribution && entry.attribution[0] && entry.attribution[0].scope === 'Window') {
                        const usage = entry.bytes;
                        if (usage > this.memoryThresholds.critical) {
                            this.triggerMemoryCleanup('advanced');
                        }
                    }
                });
            } catch (error) {
                // Fallback to standard monitoring
            }
        }, 10000);
    }

    initializeTexturePacking() {
        this.textureAtlas.packer = {
            bins: [],
            maxSize: this.textureAtlas.maxSize,

            pack(textures) {
                const canvas = document.createElement('canvas');
                canvas.width = this.maxSize;
                canvas.height = this.maxSize;
                const ctx = canvas.getContext('2d');

                let x = 0, y = 0, rowHeight = 0;

                const packedTextures = new Map();

                textures.forEach((texture, key) => {
                    if (texture.image) {
                        const img = texture.image;
                        const width = img.width;
                        const height = img.height;

                        // Check if texture fits in current row
                        if (x + width > this.maxSize) {
                            x = 0;
                            y += rowHeight;
                            rowHeight = 0;
                        }

                        // Check if texture fits in atlas
                        if (y + height <= this.maxSize) {
                            ctx.drawImage(img, x, y, width, height);

                            packedTextures.set(key, {
                                x: x / this.maxSize,
                                y: y / this.maxSize,
                                width: width / this.maxSize,
                                height: height / this.maxSize,
                                originalSize: { width, height }
                            });

                            x += width;
                            rowHeight = Math.max(rowHeight, height);
                        }
                    }
                });

                return {
                    atlas: new THREE.CanvasTexture(canvas),
                    mapping: packedTextures
                };
            }
        };
    }

    createInstancedGeometryPools() {
        const commonGeometries = [
            { name: 'sphere', factory: () => new THREE.SphereGeometry(1, 8, 6) },
            { name: 'box', factory: () => new THREE.BoxGeometry(1, 1, 1) },
            { name: 'cylinder', factory: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 8) },
            { name: 'plane', factory: () => new THREE.PlaneGeometry(1, 1, 1, 1) }
        ];

        commonGeometries.forEach(geomConfig => {
            this.instancedGeometry.pools.set(geomConfig.name, {
                baseGeometry: geomConfig.factory(),
                instances: [],
                matrix: new THREE.Matrix4(),
                color: new THREE.Color(),
                maxInstances: this.instancedGeometry.maxInstances
            });
        });
    }

    startGarbageCollector() {
        if (!this.garbageCollector.enabled) return;

        setInterval(() => {
            this.runGarbageCollection();
        }, this.garbageCollector.interval);
    }

    setupAssetStreaming() {
        this.assetStreaming.loader = {
            concurrent: 0,

            async loadAsset(assetInfo) {
                if (this.concurrent >= this.assetStreaming.maxConcurrentLoads) {
                    return false; // Queue is full
                }

                this.concurrent++;

                try {
                    const asset = await this.loadAssetByType(assetInfo);
                    this.assetStreaming.activeAssets.add(assetInfo.id);
                    this.addToMemoryPool(assetInfo.type, assetInfo.id, asset);
                    return asset;
                } catch (error) {
                    console.error(`Failed to load asset ${assetInfo.id}:`, error);
                    return null;
                } finally {
                    this.concurrent--;
                }
            },

            async loadAssetByType(assetInfo) {
                switch (assetInfo.type) {
                    case 'texture':
                        return this.loadTexture(assetInfo);
                    case 'geometry':
                        return this.loadGeometry(assetInfo);
                    case 'material':
                        return this.loadMaterial(assetInfo);
                    default:
                        throw new Error(`Unknown asset type: ${assetInfo.type}`);
                }
            },

            loadTexture(assetInfo) {
                return new Promise((resolve, reject) => {
                    const loader = new THREE.TextureLoader();
                    loader.load(
                        assetInfo.url,
                        (texture) => {
                            // Optimize texture based on usage
                            this.optimizeTexture(texture, assetInfo);
                            resolve(texture);
                        },
                        undefined,
                        reject
                    );
                });
            },

            loadGeometry(assetInfo) {
                return new Promise((resolve, reject) => {
                    const loader = new THREE.BufferGeometryLoader();
                    loader.load(assetInfo.url, resolve, undefined, reject);
                });
            },

            loadMaterial(assetInfo) {
                return new Promise((resolve, reject) => {
                    const loader = new THREE.MaterialLoader();
                    loader.load(assetInfo.url, resolve, undefined, reject);
                });
            }
        };
    }

    optimizeTexture(texture, assetInfo) {
        // Set appropriate filtering based on usage
        if (assetInfo.usage === 'ui') {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
        } else {
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
        }

        // Set wrapping
        texture.wrapS = texture.wrapT = assetInfo.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

        // Optimize format
        if (assetInfo.hasAlpha === false) {
            texture.format = THREE.RGBFormat;
        }

        // Compress if possible
        if (this.capabilities.supportsCompression) {
            texture.compressed = true;
        }
    }

    addToMemoryPool(type, id, asset) {
        if (!this.memoryPools[type]) {
            this.memoryPools[type] = new Map();
        }

        this.memoryPools[type].set(id, {
            asset,
            lastUsed: Date.now(),
            size: this.estimateAssetSize(asset),
            references: 0,
            priority: 'medium'
        });
    }

    getFromMemoryPool(type, id) {
        const pool = this.memoryPools[type];
        if (!pool) return null;

        const entry = pool.get(id);
        if (!entry) return null;

        // Update usage tracking
        entry.lastUsed = Date.now();
        entry.references++;

        return entry.asset;
    }

    estimateAssetSize(asset) {
        if (!asset) return 0;

        if (asset.isTexture) {
            const width = asset.image ? asset.image.width : 256;
            const height = asset.image ? asset.image.height : 256;
            const bytesPerPixel = asset.format === THREE.RGBFormat ? 3 : 4;
            return width * height * bytesPerPixel;
        }

        if (asset.isBufferGeometry) {
            let size = 0;
            for (const attribute of Object.values(asset.attributes)) {
                size += attribute.array.byteLength;
            }
            if (asset.index) {
                size += asset.index.array.byteLength;
            }
            return size;
        }

        if (asset.isMaterial) {
            return 1024; // Estimate for material data
        }

        return 0;
    }

    runGarbageCollection() {
        const startTime = Date.now();
        let freedMemory = 0;

        console.log('🧹 Running memory garbage collection...');

        // Clean unused assets from memory pools
        Object.entries(this.memoryPools).forEach(([type, pool]) => {
            const toDelete = [];

            pool.forEach((entry, id) => {
                const timeSinceLastUse = Date.now() - entry.lastUsed;
                const threshold = this.getUnloadThreshold(entry.priority);

                if (entry.references === 0 && timeSinceLastUse > threshold) {
                    toDelete.push(id);
                    freedMemory += entry.size;
                }
            });

            // Remove unused assets
            toDelete.forEach(id => {
                const entry = pool.get(id);
                if (entry.asset && entry.asset.dispose) {
                    entry.asset.dispose();
                }
                pool.delete(id);
                this.assetStreaming.activeAssets.delete(id);
            });

            if (toDelete.length > 0) {
                console.log(`🗑️ Freed ${toDelete.length} ${type} assets (${this.formatBytes(freedMemory)})`);
            }
        });

        // Compact texture atlas if needed
        if (this.textureAtlas.needsRebuild) {
            this.rebuildTextureAtlas();
        }

        // Update garbage collection history
        this.garbageCollector.cleanupHistory.push({
            timestamp: Date.now(),
            duration: Date.now() - startTime,
            freedMemory,
            memoryBefore: this.memoryMonitor.currentUsage
        });

        // Trim history
        if (this.garbageCollector.cleanupHistory.length > 50) {
            this.garbageCollector.cleanupHistory.shift();
        }

        this.garbageCollector.lastCleanup = Date.now();
    }

    getUnloadThreshold(priority) {
        const thresholds = {
            critical: 300000,  // 5 minutes
            high: 120000,      // 2 minutes
            medium: 60000,     // 1 minute
            low: 30000         // 30 seconds
        };

        return thresholds[priority] || thresholds.medium;
    }

    triggerMemoryCleanup(reason) {
        console.log(`🚨 Memory cleanup triggered: ${reason}`);

        switch (reason) {
            case 'critical':
                this.runAggressiveCleanup();
                break;
            case 'preventive':
                this.runGarbageCollection();
                break;
            case 'advanced':
                this.runSmartCleanup();
                break;
        }
    }

    runAggressiveCleanup() {
        console.log('🔥 Running aggressive memory cleanup...');

        // Temporarily enable aggressive mode
        const wasAggressive = this.garbageCollector.aggressiveMode;
        this.garbageCollector.aggressiveMode = true;

        // Clear all low and medium priority assets
        Object.values(this.memoryPools).forEach(pool => {
            const toDelete = [];

            pool.forEach((entry, id) => {
                if (entry.priority === 'low' || entry.priority === 'medium') {
                    toDelete.push(id);
                }
            });

            toDelete.forEach(id => {
                const entry = pool.get(id);
                if (entry.asset && entry.asset.dispose) {
                    entry.asset.dispose();
                }
                pool.delete(id);
            });
        });

        // Force rebuild texture atlas with smaller size
        this.textureAtlas.maxSize = Math.max(1024, this.textureAtlas.maxSize / 2);
        this.rebuildTextureAtlas();

        // Try to trigger browser GC if possible
        if (window.gc) {
            window.gc();
        }

        // Restore aggressive mode setting
        this.garbageCollector.aggressiveMode = wasAggressive;

        console.log('🔥 Aggressive cleanup completed');
    }

    runSmartCleanup() {
        // Intelligent cleanup based on usage patterns
        const now = Date.now();

        Object.values(this.memoryPools).forEach(pool => {
            const entries = Array.from(pool.entries());

            // Sort by usage frequency and recency
            entries.sort(([,a], [,b]) => {
                const aScore = (now - a.lastUsed) / Math.max(a.references, 1);
                const bScore = (now - b.lastUsed) / Math.max(b.references, 1);
                return bScore - aScore; // Higher score = less valuable
            });

            // Remove bottom 25% of assets
            const toRemove = entries.slice(Math.floor(entries.length * 0.75));
            toRemove.forEach(([id, entry]) => {
                if (entry.asset && entry.asset.dispose) {
                    entry.asset.dispose();
                }
                pool.delete(id);
            });
        });
    }

    triggerEmergencyCleanup() {
        console.log('🆘 EMERGENCY MEMORY CLEANUP TRIGGERED!');

        // Clear everything except critical assets
        Object.values(this.memoryPools).forEach(pool => {
            const toDelete = [];

            pool.forEach((entry, id) => {
                if (entry.priority !== 'critical') {
                    toDelete.push(id);
                }
            });

            toDelete.forEach(id => {
                const entry = pool.get(id);
                if (entry.asset && entry.asset.dispose) {
                    entry.asset.dispose();
                }
                pool.delete(id);
            });
        });

        // Reset texture atlas to minimum size
        this.textureAtlas.maxSize = 512;
        this.rebuildTextureAtlas();

        // Disable non-essential features temporarily
        this.assetStreaming.maxConcurrentLoads = 1;
        this.garbageCollector.interval = 10000; // More frequent cleanup

        console.log('🆘 Emergency cleanup completed - System in recovery mode');
    }

    rebuildTextureAtlas() {
        console.log('🔧 Rebuilding texture atlas...');

        const texturePool = this.memoryPools.textures;
        if (!texturePool || texturePool.size === 0) return;

        const textures = new Map();
        texturePool.forEach((entry, id) => {
            if (entry.asset && entry.asset.isTexture && entry.asset.image) {
                textures.set(id, entry.asset);
            }
        });

        const packed = this.textureAtlas.packer.pack(textures);

        if (packed.atlas) {
            // Dispose old atlas
            if (this.textureAtlas.atlas && this.textureAtlas.atlas.dispose) {
                this.textureAtlas.atlas.dispose();
            }

            this.textureAtlas.atlas = packed.atlas;
            this.textureAtlas.mapping = packed.mapping;
            this.textureAtlas.needsRebuild = false;

            console.log(`📦 Texture atlas rebuilt: ${packed.mapping.size} textures packed`);
        }
    }

    // Instance management for geometry reuse
    createInstancedMesh(geometryType, materials, positions) {
        const pool = this.instancedGeometry.pools.get(geometryType);
        if (!pool) return null;

        const geometry = pool.baseGeometry.clone();
        const instancedMesh = new THREE.InstancedMesh(geometry, materials, positions.length);

        positions.forEach((position, index) => {
            pool.matrix.setPosition(position.x, position.y, position.z);
            instancedMesh.setMatrixAt(index, pool.matrix);

            if (materials.color) {
                instancedMesh.setColorAt(index, pool.color.setHex(materials.color));
            }
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) {
            instancedMesh.instanceColor.needsUpdate = true;
        }

        return instancedMesh;
    }

    // Asset streaming management
    async queueAssetLoad(assetInfo) {
        assetInfo.priority = assetInfo.priority || 'medium';
        assetInfo.id = assetInfo.id || `${assetInfo.type}_${Date.now()}`;

        // Check if already loaded
        if (this.getFromMemoryPool(assetInfo.type, assetInfo.id)) {
            return this.getFromMemoryPool(assetInfo.type, assetInfo.id);
        }

        // Add to appropriate queue based on priority
        const priorityIndex = this.assetStreaming.priorityLevels.indexOf(assetInfo.priority);

        // Insert at correct position to maintain priority order
        let insertIndex = 0;
        for (let i = 0; i < this.assetStreaming.loadQueue.length; i++) {
            const itemPriority = this.assetStreaming.priorityLevels.indexOf(this.assetStreaming.loadQueue[i].priority);
            if (itemPriority > priorityIndex) {
                insertIndex = i;
                break;
            }
            insertIndex = i + 1;
        }

        this.assetStreaming.loadQueue.splice(insertIndex, 0, assetInfo);

        // Process queue
        return this.processLoadQueue();
    }

    async processLoadQueue() {
        while (this.assetStreaming.loadQueue.length > 0 &&
               this.assetStreaming.loader.concurrent < this.assetStreaming.maxConcurrentLoads) {

            const assetInfo = this.assetStreaming.loadQueue.shift();
            const asset = await this.assetStreaming.loader.loadAsset(assetInfo);

            if (asset) {
                return asset;
            }
        }

        return null;
    }

    // Preloading system
    preloadCriticalAssets() {
        const criticalAssets = [
            { type: 'texture', url: '/textures/grass.jpg', id: 'grass', priority: 'critical', usage: 'terrain' },
            { type: 'texture', url: '/textures/particles.png', id: 'particles', priority: 'critical', usage: 'effects' },
            { type: 'geometry', url: '/models/stadium.json', id: 'stadium', priority: 'critical' }
        ];

        const promises = criticalAssets.map(asset => this.queueAssetLoad(asset));
        return Promise.all(promises);
    }

    // Performance monitoring
    getMemoryReport() {
        const report = {
            system: {
                deviceMemory: this.capabilities.deviceMemory,
                jsHeapLimit: this.capabilities.jsHeapSizeLimit,
                currentUsage: this.memoryMonitor.currentUsage,
                trend: this.memoryMonitor.trend,
                utilizationPercent: Math.round((this.memoryMonitor.currentUsage / this.memoryThresholds.optimal) * 100)
            },
            pools: {},
            streaming: {
                activeAssets: this.assetStreaming.activeAssets.size,
                queuedLoads: this.assetStreaming.loadQueue.length,
                concurrentLoads: this.assetStreaming.loader.concurrent
            },
            garbageCollection: {
                lastCleanup: this.garbageCollector.lastCleanup,
                totalCleanups: this.garbageCollector.cleanupHistory.length,
                averageFreedMemory: this.calculateAverageFreedMemory()
            },
            textureAtlas: {
                size: this.textureAtlas.maxSize,
                packedTextures: this.textureAtlas.mapping ? this.textureAtlas.mapping.size : 0,
                needsRebuild: this.textureAtlas.needsRebuild
            }
        };

        // Add pool statistics
        Object.entries(this.memoryPools).forEach(([type, pool]) => {
            let totalSize = 0;
            let totalRefs = 0;

            pool.forEach(entry => {
                totalSize += entry.size;
                totalRefs += entry.references;
            });

            report.pools[type] = {
                count: pool.size,
                totalSize,
                averageSize: pool.size > 0 ? Math.round(totalSize / pool.size) : 0,
                totalReferences: totalRefs
            };
        });

        return report;
    }

    calculateAverageFreedMemory() {
        if (this.garbageCollector.cleanupHistory.length === 0) return 0;

        const total = this.garbageCollector.cleanupHistory.reduce((sum, entry) => sum + entry.freedMemory, 0);
        return Math.round(total / this.garbageCollector.cleanupHistory.length);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Cleanup and disposal
    dispose() {
        // Stop monitoring
        clearInterval(this.memoryMonitor.interval);
        clearInterval(this.garbageCollector.interval);

        // Dispose all assets in memory pools
        Object.values(this.memoryPools).forEach(pool => {
            pool.forEach(entry => {
                if (entry.asset && entry.asset.dispose) {
                    entry.asset.dispose();
                }
            });
            pool.clear();
        });

        // Dispose texture atlas
        if (this.textureAtlas.atlas && this.textureAtlas.atlas.dispose) {
            this.textureAtlas.atlas.dispose();
        }

        // Dispose instanced geometries
        this.instancedGeometry.pools.forEach(pool => {
            if (pool.baseGeometry.dispose) {
                pool.baseGeometry.dispose();
            }
        });

        console.log('🧹 Memory Optimizer disposed');
    }
}

// Texture packer utility
class TexturePacker {
    constructor() {
        this.bins = [];
        this.maxSize = 2048;
    }

    pack(textures) {
        // Simple bin packing algorithm
        const packed = new Map();
        const canvas = document.createElement('canvas');
        canvas.width = this.maxSize;
        canvas.height = this.maxSize;
        const ctx = canvas.getContext('2d');

        const sortedTextures = Array.from(textures.entries()).sort((a, b) => {
            const aSize = (a[1].image ? a[1].image.width * a[1].image.height : 0);
            const bSize = (b[1].image ? b[1].image.width * b[1].image.height : 0);
            return bSize - aSize; // Largest first
        });

        const bins = [{ x: 0, y: 0, width: this.maxSize, height: this.maxSize, used: false }];

        sortedTextures.forEach(([id, texture]) => {
            if (!texture.image) return;

            const width = texture.image.width;
            const height = texture.image.height;

            const bin = this.findBin(bins, width, height);
            if (bin) {
                ctx.drawImage(texture.image, bin.x, bin.y, width, height);

                packed.set(id, {
                    x: bin.x / this.maxSize,
                    y: bin.y / this.maxSize,
                    width: width / this.maxSize,
                    height: height / this.maxSize
                });

                this.splitBin(bins, bin, width, height);
            }
        });

        return {
            atlas: new THREE.CanvasTexture(canvas),
            mapping: packed
        };
    }

    findBin(bins, width, height) {
        return bins.find(bin => !bin.used && bin.width >= width && bin.height >= height);
    }

    splitBin(bins, usedBin, width, height) {
        usedBin.used = true;

        // Create right bin
        if (usedBin.width > width) {
            bins.push({
                x: usedBin.x + width,
                y: usedBin.y,
                width: usedBin.width - width,
                height: usedBin.height,
                used: false
            });
        }

        // Create bottom bin
        if (usedBin.height > height) {
            bins.push({
                x: usedBin.x,
                y: usedBin.y + height,
                width: width,
                height: usedBin.height - height,
                used: false
            });
        }
    }
}

// Global API
window.ChampionshipMemory = {
    optimizer: null,

    initialize() {
        if (!this.optimizer) {
            this.optimizer = new ChampionshipMemoryOptimizer();
        }
        return this.optimizer;
    },

    getFromPool(type, id) {
        return this.optimizer ? this.optimizer.getFromMemoryPool(type, id) : null;
    },

    loadAsset(assetInfo) {
        return this.optimizer ? this.optimizer.queueAssetLoad(assetInfo) : null;
    },

    createInstancedMesh(geometryType, materials, positions) {
        return this.optimizer ? this.optimizer.createInstancedMesh(geometryType, materials, positions) : null;
    },

    preloadCriticalAssets() {
        return this.optimizer ? this.optimizer.preloadCriticalAssets() : Promise.resolve([]);
    },

    triggerCleanup() {
        if (this.optimizer) {
            this.optimizer.runGarbageCollection();
        }
    },

    getMemoryReport() {
        return this.optimizer ? this.optimizer.getMemoryReport() : null;
    },

    dispose() {
        if (this.optimizer) {
            this.optimizer.dispose();
            this.optimizer = null;
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChampionshipMemory.initialize();
    });
} else {
    window.ChampionshipMemory.initialize();
}

console.log('💾 CHAMPIONSHIP MEMORY OPTIMIZER LOADED - Intelligent Memory Management Ready');