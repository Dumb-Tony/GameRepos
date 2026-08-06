param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\assets\audio")
)

$ErrorActionPreference = "Stop"

$resolvedOutput = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null

$clips = [ordered]@{
  "vale-fragment-clock.wav" = "If someone found the invoice, then the irregularity worked. I needed the payment to look wrong."
  "vale-fragment-freight.wav" = "Not a west wing. Beneath it. Meridian arrives Thursday."
  "vale-fragment-rain.wav" = "Do not trust the guest list. The names are the invitation, not the guests. Follow Northstar. If I am gone, I did not run."
  "vale-restored-message.wav" = "If someone found the invoice, then the irregularity worked. I needed the payment to look wrong. Not a west wing. Beneath it. Meridian arrives Thursday. Do not trust the guest list. The names are the invitation, not the guests. Follow Northstar. If I am gone, I did not run."
  "first-circle-vote.wav" = "The Bellwether conversion is accepted. Meridian service adoption exceeded target. Archive the mortality series for the Orpheus clinic and retain the municipal leverage files. Port Prosper is approved as the next governance site. Preposition relief assets before the first infrastructure failure. The motion carries."
}

foreach ($clip in $clips.GetEnumerator()) {
  $voice = New-Object -ComObject SAPI.SpVoice
  $stream = New-Object -ComObject SAPI.SpFileStream
  try {
    $zira = $voice.GetVoices() |
      Where-Object { $_.GetDescription() -like "*Zira*" } |
      Select-Object -First 1
    if ($zira) {
      $voice.Voice = $zira
    }
    $voice.Rate = -2
    $voice.Volume = 82
    $outputPath = Join-Path $resolvedOutput $clip.Key
    $stream.Format.Type = 22 # 22 kHz, 16-bit, mono PCM
    $stream.Open($outputPath, 3, $false) # Create for write
    $voice.AudioOutputStream = $stream
    [void]$voice.Speak($clip.Value)
  } finally {
    try { $stream.Close() } catch {}
    [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($stream)
    [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($voice)
  }
}

Get-ChildItem -LiteralPath $resolvedOutput -Filter "*.wav" |
  Select-Object Name, Length
