/**
 * Ana uygulama başlatıcı
 */
declare class DataCollectorApp {
    private collector;
    start(): Promise<void>;
    /**
     * Sistem sağlık kontrolü
     */
    private startHealthCheck;
    /**
     * Graceful shutdown
     */
    stop(): Promise<void>;
}
export default DataCollectorApp;
//# sourceMappingURL=main.d.ts.map