using UnityEngine;

namespace UnityClient.FX
{
    public class ButterflyFlight : MonoBehaviour
    {
        [Header("Path")]
        [SerializeField] private bool useViewportPath = true;
        [SerializeField] private Vector3 worldStart = new Vector3(-5f, 1.5f, 0f);
        [SerializeField] private Vector3 worldEnd = new Vector3(5f, 2f, 0f);
        [SerializeField] private float viewportStartX = -0.1f;
        [SerializeField] private float viewportEndX = 1.1f;
        [SerializeField] private float viewportY = 0.6f;
        [SerializeField] private float viewportDepth = 10f;

        [Header("Motion")]
        [SerializeField] private float durationSeconds = 6f;
        [SerializeField] private AnimationCurve horizontalEase = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);
        [SerializeField] private float waveAmplitude = 0.4f;
        [SerializeField] private float waveFrequency = 1.5f;
        [SerializeField] private bool faceMovement = true;
        [SerializeField] private float yawAmplitude = 8f;
        [SerializeField] private float rollAmplitude = 12f;

        [Header("Wings")]
        [SerializeField] private Transform leftWing;
        [SerializeField] private Transform rightWing;
        [SerializeField] private float wingFlapSpeed = 8f;
        [SerializeField] private float wingFlapAngle = 30f;

        [Header("Randomization")]
        [SerializeField] private bool randomizePhase = true;

        private float _phaseOffset;
        private float _progress;

        private void Awake()
        {
            _phaseOffset = randomizePhase ? Random.value : 0f;
        }

        private void Update()
        {
            if (durationSeconds <= 0f)
            {
                return;
            }

            _progress += Time.deltaTime / durationSeconds;
            if (_progress > 1f)
            {
                _progress -= 1f;
            }

            Vector3 start;
            Vector3 end;
            ResolvePath(out start, out end);

            float eased = horizontalEase.Evaluate(_progress);
            Vector3 position = Vector3.LerpUnclamped(start, end, eased);
            float wave = Mathf.Sin((_progress + _phaseOffset) * Mathf.PI * 2f * waveFrequency) * waveAmplitude;
            position += Vector3.up * wave;
            transform.position = position;

            ApplyBodyRotation(start, end);
            ApplyWingFlap();
        }

        private void ResolvePath(out Vector3 start, out Vector3 end)
        {
            if (useViewportPath && Camera.main != null)
            {
                start = Camera.main.ViewportToWorldPoint(new Vector3(viewportStartX, viewportY, viewportDepth));
                end = Camera.main.ViewportToWorldPoint(new Vector3(viewportEndX, viewportY, viewportDepth));
                return;
            }

            start = worldStart;
            end = worldEnd;
        }

        private void ApplyBodyRotation(Vector3 start, Vector3 end)
        {
            if (!faceMovement)
            {
                return;
            }

            Vector3 forward = (end - start).normalized;
            if (forward.sqrMagnitude <= 0.0001f)
            {
                return;
            }

            float yaw = Mathf.Sin((_progress + _phaseOffset) * Mathf.PI * 2f) * yawAmplitude;
            float roll = Mathf.Cos((_progress + _phaseOffset) * Mathf.PI * 2f) * rollAmplitude;
            Quaternion facing = Quaternion.LookRotation(forward, Vector3.up);
            Quaternion flutter = Quaternion.Euler(0f, yaw, roll);
            transform.rotation = facing * flutter;
        }

        private void ApplyWingFlap()
        {
            if (leftWing == null && rightWing == null)
            {
                return;
            }

            float flap = Mathf.Sin((Time.time + _phaseOffset) * wingFlapSpeed) * wingFlapAngle;
            if (leftWing != null)
            {
                leftWing.localRotation = Quaternion.Euler(0f, 0f, flap);
            }
            if (rightWing != null)
            {
                rightWing.localRotation = Quaternion.Euler(0f, 0f, -flap);
            }
        }

        private void OnDrawGizmosSelected()
        {
            Vector3 start;
            Vector3 end;
            ResolvePath(out start, out end);
            Gizmos.color = Color.cyan;
            Gizmos.DrawLine(start, end);
            Gizmos.DrawSphere(start, 0.1f);
            Gizmos.DrawSphere(end, 0.1f);
        }
    }
}
