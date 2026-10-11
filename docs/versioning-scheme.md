# Versioning Scheme

This project uses a three-component version number (`MAJOR.MINOR.PATCH`) with even minor versions for pre-releases and odd minor versions for stable releases.

| Component                      | Meaning                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| **Major**                      | Compatibility generation. Incremented for breaking changes |
| **Minor (even)**               | Pre-release development toward the next stable version     |
| **Minor (odd)**                | Backward-compatible stable release                         |
| **Patch (when minor is even)** | Pre-release iteration (not necessarily only bug fixes)     |
| **Patch (when minor is odd)**  | Bug fix                                                    |

### Example

| Version | Channel     | Description                |
| ------- | ----------- | -------------------------- |
| `1.2.0` | Pre-release | Development toward `1.3.0` |
| `1.2.1` | Pre-release | Additional changes         |
| `1.2.2` | Pre-release | Release candidate          |
| `1.3.0` | Stable      | Stable release of `1.2.2`  |
| `1.4.0` | Pre-release | Development toward `1.5.0` |
| `1.3.1` | Stable      | Bug fix for `1.3.0`        |
| `1.4.1` | Pre-release | Further development        |
| `1.5.0` | Stable      | Stable release of `1.4.1`  |

### Rationale

The VS Code Marketplace only supports basic `x.x.x` version numbers, and does not support SemVer pre-release suffixes such as `-beta.1`. To preserve useful pre-release semantics, we repurpose the minor and patch components slightly to encode pre-release information.

I considered many options and landed on this one because it has the following properties:

1. Pre-release versions may iterate arbitrarily by only incrementing the final number, even if features are added or breaking changes are made, without polluting the major/minor sequence of release versions.
2. A single version number alone encodes enough information to determine whether it is a pre-release or a release.
3. Numeric version ordering follows the development lifecycle, and is consistent across release channels: Release versions sort after their corresponding pre-release versions, while subsequent pre-releases sort after previous stable releases.
4. Each numeric component of the version retains approximately the conventional SemVer meanings, minimizing surprises for users and tooling.

If the VS Code Marketplace ever fully supports SemVer, this project will switch to SemVer.

### History

This was not always the versioning scheme. Prior to version 18, there was a different versioning scheme. The basic idea was to use 1.17.x for the release versions and 17.x.x for pre-release. This was an understandable compromise but worse than the current scheme due to sacrificing priorities 3 and 4 without a useful advantage. The entire 17.x.x pre-release cycle was rolled up and released as a stable release with version 18.1.0. After 18.1.0, versioning has followed the new scheme.
