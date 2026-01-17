import { useState, useEffect } from 'react';
import { Gift, Users, Copy, Share2, TrendingUp, DollarSign, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

export function ReferralProgram() {
  const { user, session } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [codeToApply, setCodeToApply] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchReferralData();
    }
  }, [user?.id]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch(`${API_BASE}/referral/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReferralCode(data.referral_code);
        setReferralCount(data.referral_count);
        setReferralEarnings(data.referral_earnings);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferral = async () => {
    const shareData = {
      title: 'Join Wassel - واصل',
      text: `Join me on Wassel and get AED 10 free! Use my referral code: ${referralCode}`,
      url: `https://wassel.app?ref=${referralCode}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        copyReferralCode();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const applyReferralCode = async () => {
    if (!codeToApply.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/referral/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify({ referral_code: codeToApply.toUpperCase() }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setCodeToApply('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to apply referral code');
    }
  };

  const milestones = [
    { count: 1, reward: 20, icon: '🎉' },
    { count: 5, reward: 100, icon: '🌟' },
    { count: 10, reward: 250, icon: '💎' },
    { count: 25, reward: 750, icon: '👑' },
    { count: 50, reward: 2000, icon: '🏆' },
  ];

  const nextMilestone = milestones.find(m => m.count > referralCount) || milestones[milestones.length - 1];
  const progress = (referralCount / nextMilestone.count) * 100;

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl">Referral Program</h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards together! برنامج الإحالة
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-3xl">{referralCount}</p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl">AED {referralEarnings}</p>
              </div>
              <DollarSign className="w-10 h-10 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Per Referral</p>
                <p className="text-3xl">AED 20</p>
              </div>
              <Gift className="w-10 h-10 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>Share this code with friends to earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="text-2xl text-center tracking-widest bg-muted"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={copyReferralCode} 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            <Button 
              onClick={shareReferral} 
              variant="outline"
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-primary" />
                <span>Your friend signs up with your referral code</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-primary" />
                <span>They get AED 10 added to their wallet instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-primary" />
                <span>You get AED 20 added to your wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-primary" />
                <span>No limit on how many friends you can refer!</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Apply Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>Have a Referral Code?</CardTitle>
          <CardDescription>Enter your friend's code to get AED 10 bonus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={codeToApply}
              onChange={(e) => setCodeToApply(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="text-center tracking-wider"
            />
            <Button 
              onClick={applyReferralCode}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Apply Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Milestones</CardTitle>
          <CardDescription>
            Reach milestones to unlock bonus rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress to Next Milestone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{referralCount} referrals</span>
              <span className="text-muted-foreground">Next: {nextMilestone.count} referrals</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {nextMilestone.count - referralCount} more to unlock AED {nextMilestone.reward} bonus!
            </p>
          </div>

          {/* Milestone List */}
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const achieved = referralCount >= milestone.count;
              return (
                <div
                  key={milestone.count}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    achieved ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{milestone.icon}</div>
                    <div>
                      <p className="font-medium">
                        {milestone.count} Referrals
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Unlock AED {milestone.reward} bonus
                      </p>
                    </div>
                  </div>
                  {achieved ? (
                    <Badge variant="default" className="bg-primary">
                      <Check className="w-3 h-3 mr-1" />
                      Achieved
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {milestone.count - referralCount} more
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
