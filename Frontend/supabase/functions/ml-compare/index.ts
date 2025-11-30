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
    const { identityHash, targetImageUrl } = await req.json();

    if (!identityHash || !targetImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: identityHash and targetImageUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('ML Compare request:', { identityHash, targetImageUrl });

    // Mock ML comparison with simulated similarity score
    const mockSimilarity = 0.75 + (Math.random() * 0.2); // Random score between 0.75-0.95
    const isMatch = mockSimilarity > 0.85;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = {
      success: true,
      similarity: parseFloat(mockSimilarity.toFixed(3)),
      isMatch,
      confidence: isMatch ? 'high' : 'medium',
      metadata: {
        model: 'mock-face-recognition-v1',
        processingTime: '0.5s',
        identityHash: identityHash.substring(0, 16) + '...',
      }
    };

    console.log('ML Compare response:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ml-compare function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
