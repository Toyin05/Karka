import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Crawler status request');

    // Mock crawler status with simulated metrics
    const platforms = ['tiktok', 'twitter', 'youtube'];
    const crawlerStatus = platforms.map(platform => ({
      platform,
      status: 'active',
      lastRun: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      itemsProcessed: Math.floor(Math.random() * 1000) + 100,
      alertsGenerated: Math.floor(Math.random() * 50) + 5,
      averageProcessingTime: `${(Math.random() * 2 + 1).toFixed(2)}s`,
      queueSize: Math.floor(Math.random() * 500) + 50,
    }));

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      crawlers: crawlerStatus,
      summary: {
        totalActive: platforms.length,
        totalProcessed: crawlerStatus.reduce((sum, c) => sum + c.itemsProcessed, 0),
        totalAlerts: crawlerStatus.reduce((sum, c) => sum + c.alertsGenerated, 0),
        overallHealth: 'healthy',
      }
    };

    console.log('Crawler status response:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in crawler-status function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
